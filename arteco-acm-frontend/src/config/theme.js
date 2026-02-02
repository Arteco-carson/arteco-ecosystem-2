export const theme = {
  token: {
    colorPrimary: '#0D0060',
    colorLink: '#0D0060',
    colorTextSecondary: '#64748b',
    colorBgLayout: '#f0f2f5',
    borderRadius: 4,
    fontFamily: "'Lato', sans-serif",
  },
  components: {
    Button: {
      fontWeight: 700,
    },
    // Ensuring standard icons default to brand color where possible
    Icon: {
      colorPrimary: '#0D0060',
    },
    Typography: {
      // Ensuring titles and strong text pop with the brand color/darkness
      colorTextHeading: '#0D0060', 
    }
  },
};
