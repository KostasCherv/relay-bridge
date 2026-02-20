import Image from 'next/image';
import ArbitrumIcon from '../public/arbitrum-icon.svg';
import OptimismIcon from '../public/optimism-icon.svg';

interface ChainIconProps {
  chain: string;
}

export const ChainIcon = ({ chain }: ChainIconProps) => {
  if (chain === 'arbitrum') {
    return (
      <Image
        src={ArbitrumIcon}
        alt="Arbitrum"
        width={24}
        height={24}
        style={{ verticalAlign: 'middle', marginRight: '4px' }}
      />
    );
  } else if (chain === 'optimism') {
    return (
      <Image
        src={OptimismIcon}
        alt="Optimism"
        width={24}
        height={24}
        style={{ verticalAlign: 'middle', marginRight: '4px' }}
      />
    );
  }
  return null;
};
