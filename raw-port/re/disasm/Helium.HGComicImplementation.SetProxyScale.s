__ZN21HGComicImplementation13SetProxyScaleERKDv2_f:
0000000000124b00	pushq	%rbp
0000000000124b01	movq	%rsp, %rbp
0000000000124b04	pushq	%r14
0000000000124b06	pushq	%rbx
0000000000124b07	movq	%rsi, %r14
0000000000124b0a	movq	%rdi, %rbx
0000000000124b0d	movss	0x50(%rdi), %xmm0
0000000000124b12	ucomiss	(%rsi), %xmm0
0000000000124b15	jbe	0x124b51
0000000000124b17	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
0000000000124b1e	movzbl	(%rax), %eax
0000000000124b21	cmpb	$0x1, %al
0000000000124b23	jne	0x124b51
0000000000124b25	movss	(%r14), %xmm0
0000000000124b2a	cvtss2sd	%xmm0, %xmm0
0000000000124b2e	movss	0x50(%rbx), %xmm1
0000000000124b33	cvtss2sd	%xmm1, %xmm1
0000000000124b37	leaq	0x7d1e30(%rip), %rdi            ## literal pool for: "gpu"
0000000000124b3e	leaq	0x7c3a01(%rip), %rdx            ## literal pool for: "proxy scale x value out of bounds :%f, clamped to minimum: %f\n"
0000000000124b45	movl	$0x2, %esi
0000000000124b4a	movb	$0x2, %al
0000000000124b4c	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000124b51	movss	0x54(%rbx), %xmm0
0000000000124b56	ucomiss	0x4(%r14), %xmm0
0000000000124b5b	jbe	0x124b98
0000000000124b5d	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
0000000000124b64	movzbl	(%rax), %eax
0000000000124b67	cmpb	$0x1, %al
0000000000124b69	jne	0x124b98
0000000000124b6b	movss	0x4(%r14), %xmm0
0000000000124b71	cvtss2sd	%xmm0, %xmm0
0000000000124b75	movss	0x54(%rbx), %xmm1
0000000000124b7a	cvtss2sd	%xmm1, %xmm1
0000000000124b7e	leaq	0x7d1de9(%rip), %rdi            ## literal pool for: "gpu"
0000000000124b85	leaq	0x7c39f9(%rip), %rdx            ## literal pool for: "proxy scale y value out of bounds :%f, clamped to minimum: %f\n"
0000000000124b8c	movl	$0x2, %esi
0000000000124b91	movb	$0x2, %al
0000000000124b93	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000124b98	movss	(%r14), %xmm0
0000000000124b9d	ucomiss	0x58(%rbx), %xmm0
0000000000124ba1	jbe	0x124bdd
0000000000124ba3	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
0000000000124baa	movzbl	(%rax), %eax
0000000000124bad	cmpb	$0x1, %al
0000000000124baf	jne	0x124bdd
0000000000124bb1	movss	(%r14), %xmm0
0000000000124bb6	cvtss2sd	%xmm0, %xmm0
0000000000124bba	movss	0x58(%rbx), %xmm1
0000000000124bbf	cvtss2sd	%xmm1, %xmm1
0000000000124bc3	leaq	0x7d1da4(%rip), %rdi            ## literal pool for: "gpu"
0000000000124bca	leaq	0x7c39f3(%rip), %rdx            ## literal pool for: "proxy scale x value out of bounds :%f, clamped to maximum: %f\n"
0000000000124bd1	movl	$0x2, %esi
0000000000124bd6	movb	$0x2, %al
0000000000124bd8	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000124bdd	movss	0x4(%r14), %xmm0
0000000000124be3	ucomiss	0x5c(%rbx), %xmm0
0000000000124be7	jbe	0x124c24
0000000000124be9	leaq	__ZN8HGLogger8_enabledE(%rip), %rax ## HGLogger::_enabled
0000000000124bf0	movzbl	(%rax), %eax
0000000000124bf3	cmpb	$0x1, %al
0000000000124bf5	jne	0x124c24
0000000000124bf7	movss	0x4(%r14), %xmm0
0000000000124bfd	cvtss2sd	%xmm0, %xmm0
0000000000124c01	movss	0x5c(%rbx), %xmm1
0000000000124c06	cvtss2sd	%xmm1, %xmm1
0000000000124c0a	leaq	0x7d1d5d(%rip), %rdi            ## literal pool for: "gpu"
0000000000124c11	leaq	0x7c39eb(%rip), %rdx            ## literal pool for: "proxy scale y value out of bounds :%f, clamped to maximum: %f\n"
0000000000124c18	movl	$0x2, %esi
0000000000124c1d	movb	$0x2, %al
0000000000124c1f	callq	__ZN8HGLogger3logEPKciS1_z      ## HGLogger::log(char const*, int, char const*, ...)
0000000000124c24	movsd	(%r14), %xmm1
0000000000124c29	movsd	0x50(%rbx), %xmm0
0000000000124c2e	movaps	%xmm1, %xmm2
0000000000124c31	maxps	%xmm0, %xmm2
0000000000124c34	xorps	%xmm3, %xmm3
0000000000124c37	cmpunordps	%xmm3, %xmm0
0000000000124c3b	blendvps	%xmm0, %xmm1, %xmm2
0000000000124c40	movsd	0x58(%rbx), %xmm0
0000000000124c45	movaps	%xmm2, %xmm1
0000000000124c48	minps	%xmm0, %xmm1
0000000000124c4b	cmpunordps	%xmm3, %xmm0
0000000000124c4f	blendvps	%xmm0, %xmm2, %xmm1
0000000000124c54	movlps	%xmm1, 0x48(%rbx)
0000000000124c58	popq	%rbx
0000000000124c59	popq	%r14
0000000000124c5b	popq	%rbp
0000000000124c5c	retq
0000000000124c5d	nopl	(%rax)
