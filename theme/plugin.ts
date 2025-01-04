import plugin from "tailwindcss/plugin";

export const scrollbarPlugin = plugin(function ({
  addUtilities,
  addComponents,
  e,
  config,
  theme,
}) {
  addComponents({
    ".scrollbar": {
      "&::-webkit-scrollbar": {
        display: "none",
      },
      scrollbarWidth: "0px",
      // scrollbarWidth: "thin",
      // overflow: "overlay",
      // "&::-webkit-scrollbar": {
      //   width: 4,
      //   height: 4,
      // },
      // "&::-webkit-scrollbar-button": {
      //   height: 0,
      // },
      // "&::-webkit-scrollbar-thumb": {
      //   background: "#c4c4c4",
      //   borderRadius: 20,
      // },
    },
    ".no-scrollbar": {
      "&::-webkit-scrollbar": {
        display: "none",
      },
      scrollbarWidth: "0px",
    },
  });
});

export const borderPlugin = plugin(function ({ addUtilities }) {
  addUtilities({
    ".border-gradient": {
      borderImage: "linear-gradient(166.54deg, #00EF8B 23.63%, #BFFA52 85.18%)",
    },
  });
});
