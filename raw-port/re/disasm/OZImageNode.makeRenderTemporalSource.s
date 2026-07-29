__ZN11OZImageNode24makeRenderTemporalSourceER14OZRenderParamsRK18OZRenderGraphStateb:
00000000001a3e70	pushq	%rbp
00000000001a3e71	movq	%rsp, %rbp
00000000001a3e74	pushq	%r15
00000000001a3e76	pushq	%r14
00000000001a3e78	pushq	%r13
00000000001a3e7a	pushq	%r12
00000000001a3e7c	pushq	%rbx
00000000001a3e7d	subq	$0x28, %rsp
00000000001a3e81	movq	%rcx, %r12
00000000001a3e84	movq	%rsi, %r13
00000000001a3e87	movq	%rdi, %rbx
00000000001a3e8a	movq	(%rsi), %rax
00000000001a3e8d	leaq	-0x48(%rbp), %rdi
00000000001a3e91	callq	*0xa8(%rax)
00000000001a3e97	movq	-0x48(%rbp), %r15
00000000001a3e9b	testq	%r15, %r15
00000000001a3e9e	je	0x1a3f6c
00000000001a3ea4	movl	$0x168, %edi                    ## imm = 0x168
00000000001a3ea9	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000001a3eae	movq	%rax, %r14
00000000001a3eb1	movq	%r15, -0x38(%rbp)
00000000001a3eb5	leaq	-0x30(%rbp), %rdi
00000000001a3eb9	leaq	-0x40(%rbp), %rsi
00000000001a3ebd	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001a3ec2	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000001a3ec9	addq	$0x10, %rax
00000000001a3ecd	movq	%rax, 0x158(%r14)
00000000001a3ed4	movq	$0x0, 0x160(%r14)
00000000001a3edf	leaq	__ZTT21OZLiElementTimeRender(%rip), %r15 ## VTT for OZLiElementTimeRender
00000000001a3ee6	addq	$0x8, %r15
00000000001a3eea	movq	%r14, %rdi
00000000001a3eed	movq	%r15, %rsi
00000000001a3ef0	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
00000000001a3ef5	leaq	__ZTV21OZLiElementTimeRender(%rip), %rax ## vtable for OZLiElementTimeRender
00000000001a3efc	leaq	0x18(%rax), %rcx
00000000001a3f00	movq	%rcx, (%r14)
00000000001a3f03	addq	$0xe8, %rax
00000000001a3f09	movq	%rax, 0x158(%r14)
00000000001a3f10	movq	%r13, 0x10(%r14)
00000000001a3f14	leaq	0x18(%r14), %r13
00000000001a3f18	movq	%r13, %rdi
00000000001a3f1b	movq	%r12, %rsi
00000000001a3f1e	callq	__ZN18OZRenderGraphStateC2ERKS_ ## OZRenderGraphState::OZRenderGraphState(OZRenderGraphState const&)
00000000001a3f23	movq	-0x38(%rbp), %rax
00000000001a3f27	movq	%rax, 0x148(%r14)
00000000001a3f2e	leaq	0x150(%r14), %rdi
00000000001a3f35	leaq	-0x30(%rbp), %r12
00000000001a3f39	movq	%r12, %rsi
00000000001a3f3c	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001a3f41	movq	$0x0, 0x140(%r14)
00000000001a3f4c	movq	%r14, (%rbx)
00000000001a3f4f	movq	(%r14), %rax
00000000001a3f52	movq	-0x18(%rax), %rsi
00000000001a3f56	addq	%r14, %rsi
00000000001a3f59	leaq	0x8(%rbx), %rdi
00000000001a3f5d	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001a3f62	movq	%r12, %rdi
00000000001a3f65	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a3f6a	jmp	0x1a3f7c
00000000001a3f6c	movq	$0x0, (%rbx)
00000000001a3f73	leaq	0x8(%rbx), %rdi
00000000001a3f77	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
00000000001a3f7c	leaq	-0x40(%rbp), %rdi
00000000001a3f80	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a3f85	movq	%rbx, %rax
00000000001a3f88	addq	$0x28, %rsp
00000000001a3f8c	popq	%rbx
00000000001a3f8d	popq	%r12
00000000001a3f8f	popq	%r13
00000000001a3f91	popq	%r14
00000000001a3f93	popq	%r15
00000000001a3f95	popq	%rbp
00000000001a3f96	retq
00000000001a3f97	movq	%rax, %rbx
00000000001a3f9a	movq	%r12, %rdi
00000000001a3f9d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a3fa2	leaq	-0x40(%rbp), %rdi
00000000001a3fa6	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a3fab	movq	%rbx, %rdi
00000000001a3fae	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3fb3	movq	%rax, %rbx
00000000001a3fb6	movq	%r13, %rdi
00000000001a3fb9	callq	__ZN18OZRenderGraphStateD1Ev    ## OZRenderGraphState::~OZRenderGraphState()
00000000001a3fbe	jmp	0x1a3fc3
00000000001a3fc0	movq	%rax, %rbx
00000000001a3fc3	movq	%r14, %rdi
00000000001a3fc6	movq	%r15, %rsi
00000000001a3fc9	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
00000000001a3fce	jmp	0x1a3fd3
00000000001a3fd0	movq	%rax, %rbx
00000000001a3fd3	movq	%r14, %rdi
00000000001a3fd6	addq	$0x158, %rdi                    ## imm = 0x158
00000000001a3fdd	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000001a3fe2	leaq	-0x30(%rbp), %rdi
00000000001a3fe6	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a3feb	jmp	0x1a3ff0
00000000001a3fed	movq	%rax, %rbx
00000000001a3ff0	movq	%r14, %rdi
00000000001a3ff3	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001a3ff8	leaq	-0x40(%rbp), %rdi
00000000001a3ffc	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4001	movq	%rbx, %rdi
00000000001a4004	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a4009	movq	%rax, %rbx
00000000001a400c	leaq	-0x40(%rbp), %rdi
00000000001a4010	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001a4015	movq	%rbx, %rdi
00000000001a4018	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a401d	nopl	(%rax)
