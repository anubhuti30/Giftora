import logging
import urllib.parse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("giftora.connectors.pinterest")


class PinterestInspirationItem(BaseModel):
    id: str
    title: str
    description: str
    inspiration_url: str
    image_url: str
    tags: List[str] = []
    source: str = "Pinterest"
    is_inspiration: bool = True


class PinterestConnector:
    """
    Pinterest Visual Inspiration Provider.
    Generates curated gift aesthetic, mood boards, and gift wrapping inspiration.
    Never represented as purchasable products; strictly visual inspiration with
    official Pinterest destination links.
    """

    def __init__(self):
        self.marketplace_name = "Pinterest"

    def get_inspirations(
        self,
        interests: List[str],
        occasion: Optional[str] = None,
        recipient_relationship: Optional[str] = None,
        limit: int = 4,
    ) -> List[PinterestInspirationItem]:
        results: List[PinterestInspirationItem] = []

        aesthetic_library = {
            "coffee": {
                "title": "Artisanal Coffee Nook & Pour-Over Aesthetic",
                "desc": "Aesthetic brewing setups, ceramic mugs, and specialty beans gift hamper ideas.",
                "img": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
                "tag": "Coffee Aesthetic"
            },
            "tea": {
                "title": "Minimalist Japanese Tea Ceremony Set",
                "desc": "Cast iron teapots, organic matcha bowls, and serene teatime rituals.",
                "img": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
                "tag": "Tea Rituals"
            },
            "ceramic": {
                "title": "Handmade Wabi-Sabi Pottery & Earthy Vases",
                "desc": "Textured stoneware, speckled ceramic tumblers, and organic clay forms.",
                "img": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
                "tag": "Ceramics"
            },
            "pottery": {
                "title": "Handcrafted Studio Pottery Inspiration",
                "desc": "Studio-crafted planters, pinch pots, and earth-toned decorative plates.",
                "img": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
                "tag": "Studio Pottery"
            },
            "aromatherapy": {
                "title": "Wild Fig, Cedarwood & Botanical Candle Moodboard",
                "desc": "Hand-poured soy wax candles, amber glass diffusers, and soothing spa gift boxes.",
                "img": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
                "tag": "Aromatherapy"
            },
            "candle": {
                "title": "Artisanal Candlelight & Fragrance Aesthetics",
                "desc": "Sculptural beeswax tapers, brass candle holders, and warm amber accents.",
                "img": "https://images.unsplash.com/photo-1508759071157-9a3153ba9b7e?auto=format&fit=crop&w=800&q=80",
                "tag": "Warm Candlelight"
            },
            "silk": {
                "title": "Heritage Silk & Botanical Textile Curation",
                "desc": "Handloom mulberry silk scarves, naturally dyed stoles, and heirloom wraps.",
                "img": "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80",
                "tag": "Silk & Textiles"
            },
            "tech": {
                "title": "Warm Walnut & Matte Black Desk Setup Inspiration",
                "desc": "Minimalist wireless desk accessories, leather desk mats, and ambient lighting.",
                "img": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                "tag": "Desk Setup"
            },
            "journal": {
                "title": "Linen Stationery & Thoughtful Desk Keepsakes",
                "desc": "Hand-bound diaries, brass fountain pens, and archival desk stationery.",
                "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                "tag": "Stationery Aesthetic"
            },
        }

        # Check interest matches
        found_keys = []
        for i in interests:
            i_low = i.lower()
            for k in aesthetic_library:
                if k in i_low and k not in found_keys:
                    found_keys.append(k)

        # Fallback to general aesthetic if no specific match
        if not found_keys:
            found_keys = ["candle", "journal"]

        for idx, key in enumerate(found_keys[:limit]):
            info = aesthetic_library[key]
            q_parts = [info["tag"], "gift ideas"]
            if occasion:
                q_parts.append(occasion)
            if recipient_relationship:
                q_parts.append(f"for {recipient_relationship}")
            query_str = " ".join(q_parts)
            pin_url = f"https://www.pinterest.com/search/pins/?q={urllib.parse.quote_plus(query_str)}"

            results.append(
                PinterestInspirationItem(
                    id=f"pin-{key}-{idx+1}",
                    title=info["title"],
                    description=info["desc"],
                    inspiration_url=pin_url,
                    image_url=info["img"],
                    tags=[info["tag"], "Visual Inspiration", "Aesthetic Idea"],
                    source="Pinterest",
                    is_inspiration=True,
                )
            )

        return results
