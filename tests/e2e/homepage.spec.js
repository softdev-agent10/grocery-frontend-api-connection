describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('loads successfully', () => {
    cy.contains('Grocery Store').should('be.visible')
  })

  it('navigates to products page', () => {
    cy.get('[data-testid="products-link"]').click()
    cy.url().should('include', '/products')
  })
})