__ZN5HGMixC2Ev:
00000000000a6d30	pushq	%rbp
00000000000a6d31	movq	%rsp, %rbp
00000000000a6d34	pushq	%r15
00000000000a6d36	pushq	%r14
00000000000a6d38	pushq	%rbx
00000000000a6d39	pushq	%rax
00000000000a6d3a	movq	%rdi, %rbx
00000000000a6d3d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000a6d42	leaq	0x96548f(%rip), %rax
00000000000a6d49	movq	%rax, (%rbx)
00000000000a6d4c	movq	$0x0, 0x198(%rbx)
00000000000a6d57	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000a6d5c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000a6d61	movq	%rax, %r14
00000000000a6d64	movq	%rax, %rdi
00000000000a6d67	callq	__ZN6HgcMixC1Ev                 ## HgcMix::HgcMix()
00000000000a6d6c	movq	0x198(%rbx), %rdi
00000000000a6d73	cmpq	%r14, %rdi
00000000000a6d76	je	0xa6d8c
00000000000a6d78	testq	%rdi, %rdi
00000000000a6d7b	je	0xa6d83
00000000000a6d7d	movq	(%rdi), %rax
00000000000a6d80	callq	*0x18(%rax)
00000000000a6d83	movq	%r14, 0x198(%rbx)
00000000000a6d8a	jmp	0xa6d9a
00000000000a6d8c	testq	%r14, %r14
00000000000a6d8f	je	0xa6d9a
00000000000a6d91	movq	(%r14), %rax
00000000000a6d94	movq	%r14, %rdi
00000000000a6d97	callq	*0x18(%rax)
00000000000a6d9a	addq	$0x8, %rsp
00000000000a6d9e	popq	%rbx
00000000000a6d9f	popq	%r14
00000000000a6da1	popq	%r15
00000000000a6da3	popq	%rbp
00000000000a6da4	retq
00000000000a6da5	movq	%rax, %rdi
00000000000a6da8	callq	___clang_call_terminate
00000000000a6dad	movq	%rax, %r15
00000000000a6db0	testq	%r14, %r14
00000000000a6db3	je	0xa6dd8
00000000000a6db5	movq	(%r14), %rax
00000000000a6db8	movq	%r14, %rdi
00000000000a6dbb	callq	*0x18(%rax)
00000000000a6dbe	jmp	0xa6dd8
00000000000a6dc0	movq	%rax, %rdi
00000000000a6dc3	callq	___clang_call_terminate
00000000000a6dc8	movq	%rax, %r15
00000000000a6dcb	movq	%r14, %rdi
00000000000a6dce	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000a6dd3	jmp	0xa6dd8
00000000000a6dd5	movq	%rax, %r15
00000000000a6dd8	movq	0x198(%rbx), %rdi
00000000000a6ddf	testq	%rdi, %rdi
00000000000a6de2	je	0xa6dea
00000000000a6de4	movq	(%rdi), %rax
00000000000a6de7	callq	*0x18(%rax)
00000000000a6dea	movq	%rbx, %rdi
00000000000a6ded	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000a6df2	movq	%r15, %rdi
00000000000a6df5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000a6dfa	movq	%rax, %rdi
00000000000a6dfd	callq	___clang_call_terminate
00000000000a6e02	nopw	%cs:(%rax,%rax)
__ZN5HGMixC1Ev:
