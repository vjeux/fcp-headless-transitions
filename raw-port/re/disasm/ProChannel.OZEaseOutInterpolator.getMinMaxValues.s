__ZN21OZEaseOutInterpolator15getMinMaxValuesER8OZSplinePvS2_RK6CMTimeS5_PdS6_:
0000000000043b10	pushq	%rbp
0000000000043b11	movq	%rsp, %rbp
0000000000043b14	pushq	%r15
0000000000043b16	pushq	%r14
0000000000043b18	pushq	%r13
0000000000043b1a	pushq	%r12
0000000000043b1c	pushq	%rbx
0000000000043b1d	subq	$0x88, %rsp
0000000000043b24	movq	%r9, %r13
0000000000043b27	movq	%r8, %r15
0000000000043b2a	movq	%rdx, %r14
0000000000043b2d	movq	%rsi, -0x68(%rbp)
0000000000043b31	movq	%rdi, %r12
0000000000043b34	movq	0x20(%rdx), %rax
0000000000043b38	movq	%rax, -0x70(%rbp)
0000000000043b3c	movups	0x10(%rdx), %xmm0
0000000000043b40	movaps	%xmm0, -0x80(%rbp)
0000000000043b44	movq	0x20(%rcx), %rax
0000000000043b48	movq	%rax, -0x50(%rbp)
0000000000043b4c	movq	%rcx, %rbx
0000000000043b4f	movups	0x10(%rcx), %xmm0
0000000000043b53	movaps	%xmm0, -0x60(%rbp)
0000000000043b57	movq	0x10(%r8), %rax
0000000000043b5b	movq	%rax, -0x30(%rbp)
0000000000043b5f	movups	(%r8), %xmm0
0000000000043b63	movaps	%xmm0, -0x40(%rbp)
0000000000043b67	movq	0x20(%rdx), %rax
0000000000043b6b	movq	%rax, 0x28(%rsp)
0000000000043b70	movups	0x10(%rdx), %xmm0
0000000000043b74	movups	%xmm0, 0x18(%rsp)
0000000000043b79	movq	-0x30(%rbp), %rax
0000000000043b7d	movq	%rax, 0x10(%rsp)
0000000000043b82	movaps	-0x40(%rbp), %xmm0
0000000000043b86	movups	%xmm0, (%rsp)
0000000000043b8a	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043b8f	testl	%eax, %eax
0000000000043b91	jle	0x43ba3
0000000000043b93	movq	0x10(%r15), %rax
0000000000043b97	movq	%rax, -0x70(%rbp)
0000000000043b9b	movups	(%r15), %xmm0
0000000000043b9f	movaps	%xmm0, -0x80(%rbp)
0000000000043ba3	movq	0x10(%r13), %rax
0000000000043ba7	movq	%rax, -0x30(%rbp)
0000000000043bab	movups	(%r13), %xmm0
0000000000043bb0	movaps	%xmm0, -0x40(%rbp)
0000000000043bb4	movq	-0x50(%rbp), %rax
0000000000043bb8	movq	%rax, 0x28(%rsp)
0000000000043bbd	movaps	-0x60(%rbp), %xmm0
0000000000043bc1	movups	%xmm0, 0x18(%rsp)
0000000000043bc6	movq	-0x30(%rbp), %rax
0000000000043bca	movq	%rax, 0x10(%rsp)
0000000000043bcf	movapd	-0x40(%rbp), %xmm0
0000000000043bd4	movupd	%xmm0, (%rsp)
0000000000043bd9	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043bde	testl	%eax, %eax
0000000000043be0	jns	0x43bf5
0000000000043be2	movq	0x10(%r13), %rax
0000000000043be6	movq	%rax, -0x50(%rbp)
0000000000043bea	movupd	(%r13), %xmm0
0000000000043bf0	movapd	%xmm0, -0x60(%rbp)
0000000000043bf5	movq	(%r12), %rax
0000000000043bf9	xorl	%ecx, %ecx
0000000000043bfb	movl	%ecx, 0x8(%rsp)
0000000000043bff	movl	%ecx, (%rsp)
0000000000043c02	movq	0x868b7(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000043c09	leaq	-0x80(%rbp), %r9
0000000000043c0d	movq	%r12, %rdi
0000000000043c10	movq	-0x68(%rbp), %r15
0000000000043c14	movq	%r15, %rsi
0000000000043c17	movq	%r14, %rcx
0000000000043c1a	movq	%rbx, %r13
0000000000043c1d	movq	%rbx, %r8
0000000000043c20	callq	*0x18(%rax)
0000000000043c23	movq	0x10(%rbp), %rbx
0000000000043c27	movsd	%xmm0, (%rbx)
0000000000043c2b	movq	(%r12), %rax
0000000000043c2f	xorl	%ecx, %ecx
0000000000043c31	movl	%ecx, 0x8(%rsp)
0000000000043c35	movl	%ecx, (%rsp)
0000000000043c38	leaq	-0x60(%rbp), %r9
0000000000043c3c	movq	%r12, %rdi
0000000000043c3f	movq	%r15, %rsi
0000000000043c42	movq	0x86877(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000043c49	movq	%r14, %rcx
0000000000043c4c	movq	%r13, %r8
0000000000043c4f	callq	*0x18(%rax)
0000000000043c52	movq	0x18(%rbp), %rax
0000000000043c56	movsd	%xmm0, (%rax)
0000000000043c5a	movsd	(%rbx), %xmm1
0000000000043c5e	ucomisd	%xmm0, %xmm1
0000000000043c62	jbe	0x43c6c
0000000000043c64	movsd	%xmm0, (%rbx)
0000000000043c68	movsd	%xmm1, (%rax)
0000000000043c6c	addq	$0x88, %rsp
0000000000043c73	popq	%rbx
0000000000043c74	popq	%r12
0000000000043c76	popq	%r13
0000000000043c78	popq	%r14
0000000000043c7a	popq	%r15
0000000000043c7c	popq	%rbp
0000000000043c7d	retq
