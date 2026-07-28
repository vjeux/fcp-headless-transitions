__ZN17PCImageAttributesaSERKS_:
000000000004a95a	pushq	%rbp
000000000004a95b	movq	%rsp, %rbp
000000000004a95e	pushq	%r14
000000000004a960	pushq	%rbx
000000000004a961	movq	%rdi, %rbx
000000000004a964	cmpq	%rsi, %rdi
000000000004a967	je	0x4a9ae
000000000004a969	movq	%rsi, %r14
000000000004a96c	movups	(%rsi), %xmm0
000000000004a96f	movups	%xmm0, (%rbx)
000000000004a972	movq	0x10(%rsi), %rax
000000000004a976	movq	%rax, 0x10(%rbx)
000000000004a97a	addq	$0x18, %rsi
000000000004a97e	leaq	0x18(%rbx), %rdi
000000000004a982	callq	__ZN7PCCFRefIP12CGColorSpaceEaSERKS2_ ## PCCFRef<CGColorSpace*>::operator=(PCCFRef<CGColorSpace*> const&)
000000000004a987	movq	0x20(%r14), %rax
000000000004a98b	movq	%rax, 0x20(%rbx)
000000000004a98f	movb	0x28(%r14), %al
000000000004a993	movb	%al, 0x28(%rbx)
000000000004a996	movq	0x30(%r14), %rax
000000000004a99a	movq	%rax, 0x30(%rbx)
000000000004a99e	movq	0x38(%r14), %rax
000000000004a9a2	movq	%rax, 0x38(%rbx)
000000000004a9a6	movq	0x40(%r14), %rax
000000000004a9aa	movq	%rax, 0x40(%rbx)
000000000004a9ae	movq	%rbx, %rax
000000000004a9b1	popq	%rbx
000000000004a9b2	popq	%r14
000000000004a9b4	popq	%rbp
000000000004a9b5	retq
