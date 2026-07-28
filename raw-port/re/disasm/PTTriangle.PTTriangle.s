__ZN10PTTriangleC1ERK9PCVector2IfES3_S3_NS_4TypeE:
00000000002ffb20	pushq	%rbp
00000000002ffb21	movq	%rsp, %rbp
00000000002ffb24	xorps	%xmm0, %xmm0
00000000002ffb27	movups	%xmm0, (%rdi)
00000000002ffb2a	movq	$0x0, 0x10(%rdi)
00000000002ffb32	movl	$0x3, 0x1c(%rdi)
00000000002ffb39	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000002ffb43	movq	%rax, 0x98(%rdi)
00000000002ffb4a	movq	%rax, 0x70(%rdi)
00000000002ffb4e	movq	%rax, 0x48(%rdi)
00000000002ffb52	movq	%rax, 0x20(%rdi)
00000000002ffb56	movups	%xmm0, 0x28(%rdi)
00000000002ffb5a	movups	%xmm0, 0x38(%rdi)
00000000002ffb5e	movups	%xmm0, 0x50(%rdi)
00000000002ffb62	movups	%xmm0, 0x60(%rdi)
00000000002ffb66	movups	%xmm0, 0x78(%rdi)
00000000002ffb6a	movups	%xmm0, 0x88(%rdi)
00000000002ffb71	movl	__ZN10PTTriangle9idCounterE(%rip), %eax ## PTTriangle::idCounter
00000000002ffb77	incl	%eax
00000000002ffb79	movl	%eax, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
00000000002ffb7f	movl	%eax, 0xa0(%rdi)
00000000002ffb85	movl	$0x0, 0xa4(%rdi)
00000000002ffb8f	movq	(%rsi), %rax
00000000002ffb92	movq	%rax, (%rdi)
00000000002ffb95	movq	(%rdx), %rax
00000000002ffb98	movq	%rax, 0x8(%rdi)
00000000002ffb9c	movq	(%rcx), %rax
00000000002ffb9f	movq	%rax, 0x10(%rdi)
00000000002ffba3	movl	%r8d, 0x18(%rdi)
00000000002ffba7	popq	%rbp
00000000002ffba8	retq
00000000002ffba9	nopl	(%rax)
