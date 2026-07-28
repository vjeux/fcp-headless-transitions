__ZN11HGSMAABlendD0Ev:
0000000000211ca0	pushq	%rbp
0000000000211ca1	movq	%rsp, %rbp
0000000000211ca4	pushq	%rbx
0000000000211ca5	pushq	%rax
0000000000211ca6	movq	%rdi, %rbx
0000000000211ca9	leaq	0x81cfa0(%rip), %rax
0000000000211cb0	movq	%rax, (%rdi)
0000000000211cb3	movq	0x198(%rdi), %rax
0000000000211cba	testq	%rax, %rax
0000000000211cbd	je	0x211ccd
0000000000211cbf	movq	-0x8(%rax), %rdi
0000000000211cc3	testq	%rdi, %rdi
0000000000211cc6	je	0x211ccd
0000000000211cc8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000211ccd	movq	%rbx, %rdi
0000000000211cd0	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000211cd5	movq	%rbx, %rdi
0000000000211cd8	addq	$0x8, %rsp
0000000000211cdc	popq	%rbx
0000000000211cdd	popq	%rbp
0000000000211cde	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000211ce3	nopw	%cs:(%rax,%rax)
