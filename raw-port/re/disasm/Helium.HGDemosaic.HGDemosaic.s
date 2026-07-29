__ZN10HGDemosaicC1Ev:
00000000000dd8d0	pushq	%rbp
00000000000dd8d1	movq	%rsp, %rbp
00000000000dd8d4	pushq	%r15
00000000000dd8d6	pushq	%r14
00000000000dd8d8	pushq	%rbx
00000000000dd8d9	pushq	%rax
00000000000dd8da	movq	%rdi, %rbx
00000000000dd8dd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000dd8e2	leaq	0x92f5a7(%rip), %rax
00000000000dd8e9	movq	%rax, (%rbx)
00000000000dd8ec	movl	$0x40, %edi
00000000000dd8f1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000dd8f6	movq	%rax, %r14
00000000000dd8f9	movq	%rax, %rdi
00000000000dd8fc	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000000dd901	leaq	0x92fc90(%rip), %rax
00000000000dd908	movq	%rax, (%r14)
00000000000dd90b	xorps	%xmm0, %xmm0
00000000000dd90e	movups	%xmm0, 0xc(%r14)
00000000000dd913	movups	%xmm0, 0x1c(%r14)
00000000000dd918	movups	%xmm0, 0x2c(%r14)
00000000000dd91d	movl	$0x0, 0x3c(%r14)
00000000000dd925	movq	%r14, 0x198(%rbx)
00000000000dd92c	addq	$0x8, %rsp
00000000000dd930	popq	%rbx
00000000000dd931	popq	%r14
00000000000dd933	popq	%r15
00000000000dd935	popq	%rbp
00000000000dd936	retq
00000000000dd937	movq	%rax, %r15
00000000000dd93a	movq	%r14, %rdi
00000000000dd93d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000dd942	movq	%rbx, %rdi
00000000000dd945	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000dd94a	movq	%r15, %rdi
00000000000dd94d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000dd952	movq	%rax, %r15
00000000000dd955	movq	%rbx, %rdi
00000000000dd958	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000dd95d	movq	%r15, %rdi
00000000000dd960	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000dd965	nopw	%cs:(%rax,%rax)
