/**
 * Tests for RBTCard component — the reflection payoff.
 * Incident prevented: reflection cards render wrong variant or crash on missing data.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RBTCard from '../../components/RBTCard';
import { createTestRBTItem } from '../factories';

describe('RBTCard', () => {
  describe('variant rendering', () => {
    test('renders rose variant with ROSE label', () => {
      render(<RBTCard variant="rose" data={createTestRBTItem()} />);
      expect(screen.getByText('ROSE')).toBeTruthy();
      expect(screen.getByText('Small win')).toBeTruthy();
    });

    test('renders bud variant with BUD label', () => {
      render(<RBTCard variant="bud" data={createTestRBTItem({ title: 'Growing' })} />);
      expect(screen.getByText('BUD')).toBeTruthy();
      expect(screen.getByText('Growing')).toBeTruthy();
    });

    test('renders thorn variant with THORN label', () => {
      render(<RBTCard variant="thorn" data={createTestRBTItem({ title: 'Hard moment' })} />);
      expect(screen.getByText('THORN')).toBeTruthy();
      expect(screen.getByText('Hard moment')).toBeTruthy();
    });
  });

  describe('content rendering', () => {
    test('renders title, body, and quote', () => {
      const data = createTestRBTItem({
        title: 'A small win',
        body: 'He ate dinner without help.',
        quote: 'dinner was a win',
      });
      render(<RBTCard variant="rose" data={data} />);

      expect(screen.getByText('A small win')).toBeTruthy();
      expect(screen.getByText('He ate dinner without help.')).toBeTruthy();
      expect(screen.getByText('"dinner was a win"')).toBeTruthy();
    });

    test('renders tags when present', () => {
      const data = createTestRBTItem({ tags: ['resilience', 'food'] });
      render(<RBTCard variant="rose" data={data} />);

      expect(screen.getByText('resilience')).toBeTruthy();
      expect(screen.getByText('food')).toBeTruthy();
    });

    test('does not render quote section when quote is empty', () => {
      const data = createTestRBTItem({ quote: '' });
      render(<RBTCard variant="rose" data={data} />);

      // Quote wrapped in quotes should not appear
      expect(screen.queryByText(/^"/)).toBeNull();
    });

    test('does not render tags section when tags array is empty', () => {
      const data = createTestRBTItem({ tags: [] });
      render(<RBTCard variant="rose" data={data} />);

      // Should render without the tags container (no crash)
      expect(screen.getByText('Small win')).toBeTruthy();
    });
  });
});
