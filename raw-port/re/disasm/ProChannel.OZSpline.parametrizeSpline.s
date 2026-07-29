__ZN8OZSpline17parametrizeSplineEv:
000000000003dc16	pushq	%rbp
000000000003dc17	movq	%rsp, %rbp
000000000003dc1a	pushq	%r15
000000000003dc1c	pushq	%r14
000000000003dc1e	pushq	%r13
000000000003dc20	pushq	%r12
000000000003dc22	pushq	%rbx
000000000003dc23	subq	$0xc8, %rsp
000000000003dc2a	movq	%rdi, %rbx
000000000003dc2d	movq	0x28(%rdi), %r13
000000000003dc31	movq	0xa0(%rdi), %rax
000000000003dc38	testq	%rax, %rax
000000000003dc3b	je	0x3dc46
000000000003dc3d	movq	0x30(%rax), %rdi
000000000003dc41	testq	%rdi, %rdi
000000000003dc44	jne	0x3dc4a
000000000003dc46	leaq	0x8(%rbx), %rdi
000000000003dc4a	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000003dc4f	cmpq	%r13, 0x30(%rbx)
000000000003dc53	je	0x3de75
000000000003dc59	movq	(%r13), %rdi
000000000003dc5d	movq	(%rdi), %rax
000000000003dc60	movq	0x8c859(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000003dc67	callq	*0x18(%rax)
000000000003dc6a	movsd	%xmm0, -0x98(%rbp)
000000000003dc72	movq	0x30(%rbx), %rax
000000000003dc76	cmpq	%r13, %rax
000000000003dc79	je	0x3de75
000000000003dc7f	movq	0x8c83a(%rip), %r14             ## literal pool symbol address: _kCMTimeZero
000000000003dc86	movq	%r13, %r15
000000000003dc89	xorl	%ecx, %ecx
000000000003dc8b	movq	%rcx, -0x30(%rbp)
000000000003dc8f	movq	%rcx, -0x40(%rbp)
000000000003dc93	movq	%rcx, -0x38(%rbp)
000000000003dc97	movq	%rcx, -0x50(%rbp)
000000000003dc9b	xorl	%ecx, %ecx
000000000003dc9d	cmpq	%rax, %r13
000000000003dca0	setne	%cl
000000000003dca3	leaq	(%r13,%rcx,8), %r13
000000000003dca8	movq	(%r15), %rdi
000000000003dcab	movq	(%rdi), %rax
000000000003dcae	movq	%r14, %rsi
000000000003dcb1	callq	*0x18(%rax)
000000000003dcb4	movsd	%xmm0, -0xa0(%rbp)
000000000003dcbc	movq	(%r15), %rdi
000000000003dcbf	cmpq	0x30(%rbx), %r13
000000000003dcc3	je	0x3de14
000000000003dcc9	movq	0x20(%rdi), %rax
000000000003dccd	movq	%rax, -0x80(%rbp)
000000000003dcd1	movups	0x10(%rdi), %xmm0
000000000003dcd5	movaps	%xmm0, -0x90(%rbp)
000000000003dcdc	movq	(%r13), %rax
000000000003dce0	movq	0x20(%rax), %rcx
000000000003dce4	movq	%rcx, -0x60(%rbp)
000000000003dce8	movups	0x10(%rax), %xmm0
000000000003dcec	movaps	%xmm0, -0x70(%rbp)
000000000003dcf0	movq	(%rdi), %rax
000000000003dcf3	leaq	-0x30(%rbp), %rsi
000000000003dcf7	leaq	-0x38(%rbp), %rdx
000000000003dcfb	movq	%r14, %rcx
000000000003dcfe	callq	*0x40(%rax)
000000000003dd01	movq	(%r13), %rdi
000000000003dd05	movq	(%rdi), %rax
000000000003dd08	leaq	-0x40(%rbp), %rsi
000000000003dd0c	leaq	-0x50(%rbp), %rdx
000000000003dd10	movq	%r14, %rcx
000000000003dd13	callq	*0x38(%rax)
000000000003dd16	movsd	-0x30(%rbp), %xmm0
000000000003dd1b	movsd	%xmm0, -0x48(%rbp)
000000000003dd20	movq	-0x80(%rbp), %rax
000000000003dd24	movq	%rax, 0x28(%rsp)
000000000003dd29	movaps	-0x90(%rbp), %xmm0
000000000003dd30	movups	%xmm0, 0x18(%rsp)
000000000003dd35	movq	-0x60(%rbp), %rax
000000000003dd39	movq	%rax, 0x10(%rsp)
000000000003dd3e	movaps	-0x70(%rbp), %xmm0
000000000003dd42	movups	%xmm0, (%rsp)
000000000003dd46	leaq	-0xb8(%rbp), %r12
000000000003dd4d	movq	%r12, %rdi
000000000003dd50	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003dd55	movq	-0xa8(%rbp), %rax
000000000003dd5c	movq	%rax, 0x10(%rsp)
000000000003dd61	movupd	-0xb8(%rbp), %xmm0
000000000003dd69	movupd	%xmm0, (%rsp)
000000000003dd6e	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000003dd73	movsd	-0x48(%rbp), %xmm1
000000000003dd78	divsd	%xmm0, %xmm1
000000000003dd7c	movsd	%xmm1, -0x30(%rbp)
000000000003dd81	movsd	-0x40(%rbp), %xmm0
000000000003dd86	movsd	%xmm0, -0x48(%rbp)
000000000003dd8b	movq	-0x80(%rbp), %rax
000000000003dd8f	movq	%rax, 0x28(%rsp)
000000000003dd94	movaps	-0x90(%rbp), %xmm0
000000000003dd9b	movups	%xmm0, 0x18(%rsp)
000000000003dda0	movq	-0x60(%rbp), %rax
000000000003dda4	movq	%rax, 0x10(%rsp)
000000000003dda9	movaps	-0x70(%rbp), %xmm0
000000000003ddad	movups	%xmm0, (%rsp)
000000000003ddb1	movq	%r12, %rdi
000000000003ddb4	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003ddb9	movq	-0xa8(%rbp), %rax
000000000003ddc0	movq	%rax, 0x10(%rsp)
000000000003ddc5	movupd	-0xb8(%rbp), %xmm0
000000000003ddcd	movupd	%xmm0, (%rsp)
000000000003ddd2	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000003ddd7	movsd	-0x48(%rbp), %xmm1
000000000003dddc	divsd	%xmm0, %xmm1
000000000003dde0	movsd	%xmm1, -0x40(%rbp)
000000000003dde5	movq	(%r15), %rdi
000000000003dde8	movsd	-0x30(%rbp), %xmm0
000000000003dded	movsd	-0x38(%rbp), %xmm1
000000000003ddf2	movq	(%rdi), %rax
000000000003ddf5	movq	%r14, %rsi
000000000003ddf8	callq	*0x50(%rax)
000000000003ddfb	movq	(%r13), %rdi
000000000003ddff	movsd	-0x40(%rbp), %xmm0
000000000003de04	movsd	-0x50(%rbp), %xmm1
000000000003de09	movq	(%rdi), %rax
000000000003de0c	movq	%r14, %rsi
000000000003de0f	callq	*0x48(%rax)
000000000003de12	jmp	0x3de48
000000000003de14	movq	(%rdi), %rax
000000000003de17	leaq	-0x30(%rbp), %rsi
000000000003de1b	leaq	-0x38(%rbp), %rdx
000000000003de1f	movq	%r14, %rcx
000000000003de22	callq	*0x38(%rax)
000000000003de25	movq	(%r15), %rdi
000000000003de28	movsd	-0x30(%rbp), %xmm0
000000000003de2d	movaps	0x7280c(%rip), %xmm2
000000000003de34	xorps	%xmm2, %xmm0
000000000003de37	movsd	-0x38(%rbp), %xmm1
000000000003de3c	xorps	%xmm2, %xmm1
000000000003de3f	movq	(%rdi), %rax
000000000003de42	movq	%r14, %rsi
000000000003de45	callq	*0x50(%rax)
000000000003de48	movq	(%r15), %rdi
000000000003de4b	movsd	-0xa0(%rbp), %xmm0
000000000003de53	subsd	-0x98(%rbp), %xmm0
000000000003de5b	movq	(%rdi), %rax
000000000003de5e	movq	%r14, %rsi
000000000003de61	callq	*0x20(%rax)
000000000003de64	addq	$0x8, %r15
000000000003de68	movq	0x30(%rbx), %rax
000000000003de6c	cmpq	%rax, %r15
000000000003de6f	jne	0x3dc89
000000000003de75	movq	%rbx, %rdi
000000000003de78	callq	__ZN8OZSpline13reparametrizeEv  ## OZSpline::reparametrize()
000000000003de7d	movq	0xa0(%rbx), %rax
000000000003de84	testq	%rax, %rax
000000000003de87	je	0x3de92
000000000003de89	movq	0x30(%rax), %rdi
000000000003de8d	testq	%rdi, %rdi
000000000003de90	jne	0x3de99
000000000003de92	addq	$0x8, %rbx
000000000003de96	movq	%rbx, %rdi
000000000003de99	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000003de9e	addq	$0xc8, %rsp
000000000003dea5	popq	%rbx
000000000003dea6	popq	%r12
000000000003dea8	popq	%r13
000000000003deaa	popq	%r14
000000000003deac	popq	%r15
000000000003deae	popq	%rbp
000000000003deaf	retq
