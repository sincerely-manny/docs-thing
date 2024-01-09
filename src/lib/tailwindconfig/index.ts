import tailwindConfig from '../../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';

const tailwindConfigResolved = resolveConfig(tailwindConfig);

export default tailwindConfigResolved.theme;
