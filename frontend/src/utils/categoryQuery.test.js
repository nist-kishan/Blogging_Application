import test from 'node:test';
import assert from 'node:assert/strict';
import { getSelectedCategoryFromSearch } from './categoryQuery.js';

test('reads category slug from URL search params', () => {
  assert.equal(getSelectedCategoryFromSearch('?category=technology'), 'technology');
  assert.equal(getSelectedCategoryFromSearch('?category=sports-fitness'), 'sports-fitness');
  assert.equal(getSelectedCategoryFromSearch(''), null);
});
