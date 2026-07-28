__ZN11HGColorBiasC2Ev:
00000000001a0c30	pushq	%rbp
00000000001a0c31	movq	%rsp, %rbp
00000000001a0c34	pushq	%r15
00000000001a0c36	pushq	%r14
00000000001a0c38	pushq	%rbx
00000000001a0c39	pushq	%rax
00000000001a0c3a	movq	%rdi, %rbx
00000000001a0c3d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001a0c42	leaq	0x883c1f(%rip), %rax
00000000001a0c49	movq	%rax, (%rbx)
00000000001a0c4c	movq	$0x0, 0x198(%rbx)
00000000001a0c57	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001a0c5c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001a0c61	movq	%rax, %r14
00000000001a0c64	movq	%rax, %rdi
00000000001a0c67	callq	__ZN18HgcColorGamma_biasC1Ev    ## HgcColorGamma_bias::HgcColorGamma_bias()
00000000001a0c6c	movq	0x198(%rbx), %rdi
00000000001a0c73	cmpq	%r14, %rdi
00000000001a0c76	je	0x1a0c8c
00000000001a0c78	testq	%rdi, %rdi
00000000001a0c7b	je	0x1a0c83
00000000001a0c7d	movq	(%rdi), %rax
00000000001a0c80	callq	*0x18(%rax)
00000000001a0c83	movq	%r14, 0x198(%rbx)
00000000001a0c8a	jmp	0x1a0c9a
00000000001a0c8c	testq	%r14, %r14
00000000001a0c8f	je	0x1a0c9a
00000000001a0c91	movq	(%r14), %rax
00000000001a0c94	movq	%r14, %rdi
00000000001a0c97	callq	*0x18(%rax)
00000000001a0c9a	addq	$0x8, %rsp
00000000001a0c9e	popq	%rbx
00000000001a0c9f	popq	%r14
00000000001a0ca1	popq	%r15
00000000001a0ca3	popq	%rbp
00000000001a0ca4	retq
00000000001a0ca5	movq	%rax, %rdi
00000000001a0ca8	callq	___clang_call_terminate
00000000001a0cad	movq	%rax, %r15
00000000001a0cb0	testq	%r14, %r14
00000000001a0cb3	je	0x1a0cd8
00000000001a0cb5	movq	(%r14), %rax
00000000001a0cb8	movq	%r14, %rdi
00000000001a0cbb	callq	*0x18(%rax)
00000000001a0cbe	jmp	0x1a0cd8
00000000001a0cc0	movq	%rax, %rdi
00000000001a0cc3	callq	___clang_call_terminate
00000000001a0cc8	movq	%rax, %r15
00000000001a0ccb	movq	%r14, %rdi
00000000001a0cce	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001a0cd3	jmp	0x1a0cd8
00000000001a0cd5	movq	%rax, %r15
00000000001a0cd8	movq	0x198(%rbx), %rdi
00000000001a0cdf	testq	%rdi, %rdi
00000000001a0ce2	je	0x1a0cea
00000000001a0ce4	movq	(%rdi), %rax
00000000001a0ce7	callq	*0x18(%rax)
00000000001a0cea	movq	%rbx, %rdi
00000000001a0ced	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001a0cf2	movq	%r15, %rdi
00000000001a0cf5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001a0cfa	movq	%rax, %rdi
00000000001a0cfd	callq	___clang_call_terminate
00000000001a0d02	nopw	%cs:(%rax,%rax)
