import { removeStopwords, eng } from "stopword";
import natural from "natural";

const proProcessSearchString = (searchString) => {
  try {
    const trimmedSearchString = searchString.toLowerCase().trim();
    const searchArray = trimmedSearchString.split(" ");
    const removedShit = removeStopwords(searchArray, eng);

    const betterSearchArray = removedShit?.filter((element) => {
      if (element && element?.length < 2) {
        return false;
      }
      return true;
    });

    const stemmerSearchArray = betterSearchArray.map((word) =>
      natural.PorterStemmer.stem(word)
    );

    return stemmerSearchArray;
  } catch (error) {
    throw new Error(error);
  }
};
export const searchSite = async (req, res) => {
  try {
    const { searchString } = req.body;
    const betterSearchArray = proProcessSearchString(searchString);

    res.status(200).send(betterSearchArray);
  } catch (error) {
    res.status(500).send(error);
  }
};
