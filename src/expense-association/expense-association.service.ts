import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseAssociationDto } from './dto/create-expense-association.dto';
import { UpdateExpenseAssociationDto } from './dto/update-expense-association.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { ExpenseAssociation } from './entities/expense-association.entity';
import { ExpenseItem } from 'src/expense-item/entities/expense-item.entity';

@Injectable()
export class ExpenseAssociationService {
  constructor(
    @InjectRepository(ExpenseAssociation)
    private readonly expenseAssociationRepository: Repository<ExpenseAssociation>,
    @InjectRepository(ExpenseItem)
    private readonly expenseItemRepository: Repository<ExpenseItem>,
  ) {}

  async create(createExpenseAssociationDto: CreateExpenseAssociationDto) {
    const expenseAssociation = this.expenseAssociationRepository.create(
      createExpenseAssociationDto,
    );
    return await this.expenseAssociationRepository.save(expenseAssociation);
  }

  findAll() {
    return this.expenseAssociationRepository.find();
  }

  findOne(id: number) {
    return this.expenseAssociationRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateExpenseAssociationDto: UpdateExpenseAssociationDto,
  ) {
    const expenseAssociation = await this.findOne(id);
    if (!expenseAssociation) throw new NotFoundException();

    Object.assign(expenseAssociation, updateExpenseAssociationDto);

    return this.expenseAssociationRepository.save(expenseAssociation);
  }

  async remove(id: number) {
    const expenseAssociation = await this.findOne(id);
    if (!expenseAssociation) throw new NotFoundException();

    return await this.expenseAssociationRepository.remove(expenseAssociation);
  }

  /**
   * Lowercases, strips accents, digits and punctuation, drops one-letter
   * tokens and collapses whitespace, so "UBER *TRIP 12/03" and
   * "Uber Trip 28/04" both become "uber trip".
   */
  private normalizeDescription(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1)
      .join(' ');
  }

  /**
   * Creates associations from existing typed expense items. Descriptions are
   * normalized and grouped; a group that repeats at least `MIN_OCCURRENCES`
   * times and always has the same expense type becomes an association.
   * Groups with conflicting types, or already covered by an existing
   * association with the same item, are skipped.
   */
  async generate_associations() {
    const MIN_OCCURRENCES = 2;

    const [items, existing] = await Promise.all([
      this.expenseItemRepository.find({
        where: { expenseTypeId: Not(IsNull()) },
      }),
      this.expenseAssociationRepository.find(),
    ]);

    const groups = new Map<string, { count: number; typeIds: Set<number> }>();
    for (const item of items) {
      const key = this.normalizeDescription(item.description);
      if (!key) continue;
      const group = groups.get(key) ?? { count: 0, typeIds: new Set() };
      group.count++;
      group.typeIds.add(item.expenseTypeId);
      groups.set(key, group);
    }

    const existingItems = new Set(
      existing.map((a) => this.normalizeDescription(a.item)),
    );

    const toCreate: Pick<ExpenseAssociation, 'item' | 'expenseTypeId'>[] = [];
    const conflicts: { item: string; typeIds: number[] }[] = [];

    for (const [key, group] of groups) {
      if (group.count < MIN_OCCURRENCES || existingItems.has(key)) continue;
      if (group.typeIds.size > 1) {
        conflicts.push({ item: key, typeIds: [...group.typeIds] });
        continue;
      }
      toCreate.push({ item: key, expenseTypeId: [...group.typeIds][0] });
    }

    const created = await this.expenseAssociationRepository.save(
      this.expenseAssociationRepository.create(toCreate),
    );

    return { created: created.length, associations: created, conflicts };
  }

  /**
   * Finds expense items without an expense type and assigns one when their
   * description contains a saved association's `item` (case-insensitive).
   * The association's `expenseTypeId` is the type assigned to the item.
   * Longer association items win over shorter ones.
   */
  async analyze() {
    const [associations, items] = await Promise.all([
      this.expenseAssociationRepository.find(),
      this.expenseItemRepository.find({
        where: { expenseTypeId: IsNull() },
      }),
    ]);

    const normalize = (value: string) => this.normalizeDescription(value);

    const rules = associations
      .map((a) => ({
        item: normalize(a.item),
        typeId: a.expenseTypeId,
      }))
      .filter((r) => r.item.length > 0)
      .sort((a, b) => b.item.length - a.item.length);

    const associated: { id: number; description: string; typeId: number }[] =
      [];

    for (const item of items) {
      const description = normalize(item.description);
      const rule = rules.find((r) => description.includes(r.item));
      if (!rule) continue;

      await this.expenseItemRepository.update(item.id, {
        expenseTypeId: rule.typeId,
      });
      associated.push({
        id: item.id,
        description: item.description,
        typeId: rule.typeId,
      });
    }

    return {
      analyzed: items.length,
      associated: associated.length,
      unmatched: items.length - associated.length,
      items: associated,
    };
  }
}
