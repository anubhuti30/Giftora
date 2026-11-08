from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product, ProductSource, PriceSnapshot


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        category: Optional[str] = None,
        marketplace: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        search_query: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Product]:
        query = self.db.query(Product).join(Product.sources)

        if category and category.lower() != "all":
            query = query.filter(Product.category.ilike(f"%{category}%"))

        if marketplace and marketplace.lower() != "all":
            query = query.filter(ProductSource.marketplace_name.ilike(f"%{marketplace}%"))

        if max_price is not None:
            query = query.filter(ProductSource.current_price <= max_price)

        if search_query:
            term = f"%{search_query}%"
            query = query.filter(
                or_(
                    Product.canonical_name.ilike(term),
                    Product.description.ilike(term),
                    ProductSource.product_title.ilike(term),
                )
            )

        return query.distinct().offset(offset).limit(limit).all()

    def get_by_id(self, product_id: str) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_source_by_id(self, source_id: str) -> Optional[ProductSource]:
        return self.db.query(ProductSource).filter(ProductSource.id == source_id).first()

    def get_sources_by_ids(self, source_ids: List[str]) -> List[ProductSource]:
        return self.db.query(ProductSource).filter(ProductSource.id.in_(source_ids)).all()

    def get_all_sources(self) -> List[ProductSource]:
        return self.db.query(ProductSource).all()
