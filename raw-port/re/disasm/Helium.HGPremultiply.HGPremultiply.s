__ZN13HGPremultiplyC1Ev:
0000000000157af0	pushq	%rbp
0000000000157af1	movq	%rsp, %rbp
0000000000157af4	pushq	%r15
0000000000157af6	pushq	%r14
0000000000157af8	pushq	%rbx
0000000000157af9	pushq	%rax
0000000000157afa	movq	%rdi, %rbx
0000000000157afd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157b02	leaq	0x8c867f(%rip), %rax
0000000000157b09	movq	%rax, (%rbx)
0000000000157b0c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157b11	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157b16	movq	%rax, %r14
0000000000157b19	movq	%rax, %rdi
0000000000157b1c	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
0000000000157b21	movq	%r14, 0x198(%rbx)
0000000000157b28	addq	$0x8, %rsp
0000000000157b2c	popq	%rbx
0000000000157b2d	popq	%r14
0000000000157b2f	popq	%r15
0000000000157b31	popq	%rbp
0000000000157b32	retq
0000000000157b33	movq	%rax, %r15
0000000000157b36	movq	%r14, %rdi
0000000000157b39	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157b3e	movq	%rbx, %rdi
0000000000157b41	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157b46	movq	%r15, %rdi
0000000000157b49	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157b4e	movq	%rax, %r15
0000000000157b51	movq	%rbx, %rdi
0000000000157b54	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157b59	movq	%r15, %rdi
0000000000157b5c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157b61	nopw	%cs:(%rax,%rax)
