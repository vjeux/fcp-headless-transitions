__ZN23FFNRRendererInfoManagerD1Ev:
00000000006c6140	pushq	%rbp
00000000006c6141	movq	%rsp, %rbp
00000000006c6144	pushq	%r14
00000000006c6146	pushq	%rbx
00000000006c6147	movq	%rdi, %rbx
00000000006c614a	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c6151	movq	0x14f2f30(%rip), %r14
00000000006c6158	movq	%r14, %rsi
00000000006c615b	callq	*0x122755f(%rip)                ## Objc message: -[%rdi sharpnessAmount]
00000000006c6161	movq	0x1510fa8(%rip), %rsi
00000000006c6168	movq	%rax, %rdi
00000000006c616b	xorl	%edx, %edx
00000000006c616d	xorl	%ecx, %ecx
00000000006c616f	callq	*0x122754b(%rip)                ## Objc message: -[%rdi sharpnessAmount]
00000000006c6175	cmpq	$0x0, (%rbx)
00000000006c6179	je	0x6c61a5
00000000006c617b	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c6182	movq	%r14, %rsi
00000000006c6185	callq	*0x1227535(%rip)                ## Objc message: -[%rdi sharpnessAmount]
00000000006c618b	movq	(%rbx), %rdx
00000000006c618e	movq	0x1510f83(%rip), %rsi
00000000006c6195	movq	%rax, %rdi
00000000006c6198	callq	*0x1227522(%rip)                ## Objc message: -[%rdi sharpnessAmount]
00000000006c619e	movq	$0x0, (%rbx)
00000000006c61a5	movq	0x8(%rbx), %rdi
00000000006c61a9	callq	*0x1227559(%rip)                ## literal pool symbol address: _objc_release
00000000006c61af	movq	$0x0, 0x8(%rbx)
00000000006c61b7	popq	%rbx
00000000006c61b8	popq	%r14
00000000006c61ba	popq	%rbp
00000000006c61bb	retq
00000000006c61bc	movq	%rax, %rdi
00000000006c61bf	callq	___clang_call_terminate
00000000006c61c4	nopw	%cs:(%rax,%rax)
