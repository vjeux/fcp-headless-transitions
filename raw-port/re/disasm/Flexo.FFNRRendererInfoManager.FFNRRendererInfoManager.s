__ZN23FFNRRendererInfoManagerC1EPK8FxDeviceU13block_pointerFbvE:
00000000006c5f60	pushq	%rbp
00000000006c5f61	movq	%rsp, %rbp
00000000006c5f64	pushq	%r15
00000000006c5f66	pushq	%r14
00000000006c5f68	pushq	%r13
00000000006c5f6a	pushq	%r12
00000000006c5f6c	pushq	%rbx
00000000006c5f6d	pushq	%rax
00000000006c5f6e	movq	%rdx, %r15
00000000006c5f71	movq	%rdi, %rbx
00000000006c5f74	xorps	%xmm0, %xmm0
00000000006c5f77	movups	%xmm0, (%rdi)
00000000006c5f7a	movq	%rsi, %rdi
00000000006c5f7d	callq	_FFImageLocationSetForSingleLocation
00000000006c5f82	movq	%rax, %r12
00000000006c5f85	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c5f8c	movq	0x14f30f5(%rip), %r14
00000000006c5f93	movq	0x1227726(%rip), %r13           ## Objc message: -[%rdi sharpnessAmount]
00000000006c5f9a	movq	%r14, %rsi
00000000006c5f9d	callq	*%r13
00000000006c5fa0	movq	0x1511159(%rip), %rsi
00000000006c5fa7	movq	%rax, %rdi
00000000006c5faa	movq	%r12, %rdx
00000000006c5fad	movq	%r15, %rcx
00000000006c5fb0	movq	%r13, %r15
00000000006c5fb3	callq	*%r13
00000000006c5fb6	movq	%rax, (%rbx)
00000000006c5fb9	testq	%rax, %rax
00000000006c5fbc	je	0x6c601f
00000000006c5fbe	leaq	_OBJC_CLASS_$_FFImageRepBindingInfo(%rip), %rdi
00000000006c5fc5	callq	0x14978fc                       ## symbol stub for: _objc_alloc
00000000006c5fca	movq	(%rbx), %rdx
00000000006c5fcd	movq	0x1511134(%rip), %rsi
00000000006c5fd4	movq	%rax, %rdi
00000000006c5fd7	callq	*%r15
00000000006c5fda	movq	%rax, 0x8(%rbx)
00000000006c5fde	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c5fe5	movq	%r14, %rsi
00000000006c5fe8	callq	*%r15
00000000006c5feb	movq	%rax, %r14
00000000006c5fee	movq	(%rbx), %rdi
00000000006c5ff1	movq	0x1502df8(%rip), %rsi
00000000006c5ff8	callq	*%r15
00000000006c5ffb	movq	0x8(%rbx), %rcx
00000000006c5fff	movq	0x151110a(%rip), %rsi
00000000006c6006	movq	%r14, %rdi
00000000006c6009	movq	%rax, %rdx
00000000006c600c	movq	%r15, %rax
00000000006c600f	addq	$0x8, %rsp
00000000006c6013	popq	%rbx
00000000006c6014	popq	%r12
00000000006c6016	popq	%r13
00000000006c6018	popq	%r14
00000000006c601a	popq	%r15
00000000006c601c	popq	%rbp
00000000006c601d	jmpq	*%rax
00000000006c601f	addq	$0x8, %rsp
00000000006c6023	popq	%rbx
00000000006c6024	popq	%r12
00000000006c6026	popq	%r13
00000000006c6028	popq	%r14
00000000006c602a	popq	%r15
00000000006c602c	popq	%rbp
00000000006c602d	retq
00000000006c602e	nop
