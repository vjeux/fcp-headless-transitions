__ZN28OZMaterialGenericSubstanceIF9flatColorERK6CMTimeP7PCColor:
00000000004c1ac0	pushq	%rbp
00000000004c1ac1	movq	%rsp, %rbp
00000000004c1ac4	pushq	%r14
00000000004c1ac6	pushq	%rbx
00000000004c1ac7	movq	%rdx, %rbx
00000000004c1aca	movq	%rsi, %r14
00000000004c1acd	movq	(%rdi), %rax
00000000004c1ad0	callq	*0x20(%rax)
00000000004c1ad3	movq	(%rax), %rcx
00000000004c1ad6	movq	0x328(%rcx), %rcx
00000000004c1add	xorps	%xmm0, %xmm0
00000000004c1ae0	movq	%rax, %rdi
00000000004c1ae3	movq	%r14, %rsi
00000000004c1ae6	movq	%rbx, %rdx
00000000004c1ae9	popq	%rbx
00000000004c1aea	popq	%r14
00000000004c1aec	popq	%rbp
00000000004c1aed	jmpq	*%rcx
00000000004c1aef	nop
