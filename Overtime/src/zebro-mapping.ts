import { Zebro } from "../generated/schema";
import { Mint } from "../generated/ZebroNFT/ZebroNFT";


export function handleMint(event: Mint): void {
    const zebro = new Zebro(event.transaction.from.toHex() + event.params._id.toHex());
    zebro.owner = event.params._recipient;
    zebro.tokenId = event.params._id;
    zebro.country = event.params._country;
    zebro.countryName = event.params._countryName;
    zebro.url = event.params._url;
    zebro.save();
}
