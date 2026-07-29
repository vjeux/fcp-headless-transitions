__ZN11OZImageNode21makeRenderImageSourceER14OZRenderParamsRK18OZRenderGraphStateb:
00000000001a3e00	pushq	%rbp
00000000001a3e01	movq	%rsp, %rbp
00000000001a3e04	pushq	%r15
00000000001a3e06	pushq	%r14
00000000001a3e08	pushq	%r12
00000000001a3e0a	pushq	%rbx
00000000001a3e0b	movq	%rdx, %r15
00000000001a3e0e	movq	%rsi, %r12
00000000001a3e11	movq	%rdi, %rbx
00000000001a3e14	movl	$0x5f0, %edi                    ## imm = 0x5F0
00000000001a3e19	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000001a3e1e	movq	%rax, %r14
00000000001a3e21	movq	%rax, %rdi
00000000001a3e24	movq	%r12, %rsi
00000000001a3e27	movq	%r15, %rdx
00000000001a3e2a	callq	__ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams ## OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&)
00000000001a3e2f	movq	(%r14), %rax
00000000001a3e32	movq	-0x18(%rax), %rcx
00000000001a3e36	addq	%r14, %rcx
00000000001a3e39	movq	%rcx, (%rbx)
00000000001a3e3c	movq	-0x20(%rax), %rsi
00000000001a3e40	addq	%r14, %rsi
00000000001a3e43	movq	%rbx, %rdi
00000000001a3e46	addq	$0x8, %rdi
00000000001a3e4a	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001a3e4f	movq	%rbx, %rax
00000000001a3e52	popq	%rbx
00000000001a3e53	popq	%r12
00000000001a3e55	popq	%r14
00000000001a3e57	popq	%r15
00000000001a3e59	popq	%rbp
00000000001a3e5a	retq
00000000001a3e5b	movq	%rax, %rbx
00000000001a3e5e	movq	%r14, %rdi
00000000001a3e61	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001a3e66	movq	%rbx, %rdi
00000000001a3e69	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3e6e	nop
