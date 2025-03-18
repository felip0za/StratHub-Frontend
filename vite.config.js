import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /*server: {
    host: 'meusite.local', // Nome personalizado
    port: 5173, // Porta padrão do Vite (pode ser alterada)
  },*/
})
