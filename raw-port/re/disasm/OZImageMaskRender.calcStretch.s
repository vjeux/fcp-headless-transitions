__ZN17OZImageMaskRender11calcStretchER7LiAgent:
000000000046e9c0	pushq	%rbp
000000000046e9c1	movq	%rsp, %rbp
000000000046e9c4	pushq	%r15
000000000046e9c6	pushq	%r14
000000000046e9c8	pushq	%rbx
000000000046e9c9	subq	$0x48, %rsp
000000000046e9cd	movq	%rdx, %r14
000000000046e9d0	movq	%rsi, %r15
000000000046e9d3	movq	%rdi, %rbx
000000000046e9d6	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000046e9e0	movq	%rax, 0x78(%rdi)
000000000046e9e4	movq	%rax, 0x50(%rdi)
000000000046e9e8	movq	%rax, 0x28(%rdi)
000000000046e9ec	movq	%rax, (%rdi)
000000000046e9ef	xorpd	%xmm0, %xmm0
000000000046e9f3	movupd	%xmm0, 0x8(%rdi)
000000000046e9f8	movupd	%xmm0, 0x18(%rdi)
000000000046e9fd	movupd	%xmm0, 0x30(%rdi)
000000000046ea02	movupd	%xmm0, 0x40(%rdi)
000000000046ea07	movupd	%xmm0, 0x58(%rdi)
000000000046ea0c	movupd	%xmm0, 0x68(%rdi)
000000000046ea11	movq	0x5d8(%rsi), %rdi
000000000046ea18	movq	(%rdi), %rax
000000000046ea1b	callq	*0x520(%rax)
000000000046ea21	testb	%al, %al
000000000046ea23	je	0x46ebcc
000000000046ea29	xorps	%xmm1, %xmm1
000000000046ea2c	movaps	%xmm1, -0x40(%rbp)
000000000046ea30	movaps	0x296989(%rip), %xmm0
000000000046ea37	movaps	%xmm0, -0x30(%rbp)
000000000046ea3b	movaps	%xmm1, -0x60(%rbp)
000000000046ea3f	movaps	%xmm0, -0x50(%rbp)
000000000046ea43	movq	0x5d0(%r15), %rax
000000000046ea4a	testq	%rax, %rax
000000000046ea4d	je	0x46ea55
000000000046ea4f	movq	0x10(%rax), %rdi
000000000046ea53	jmp	0x46ea72
000000000046ea55	movq	0x5e0(%r15), %rdi
000000000046ea5c	testq	%rdi, %rdi
000000000046ea5f	jne	0x46ea72
000000000046ea61	movl	$0x1, %edi
000000000046ea66	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000046ea6b	movq	0x5e0(%r15), %rdi
000000000046ea72	movq	(%rdi), %rax
000000000046ea75	leaq	-0x40(%rbp), %rdx
000000000046ea79	movq	%r14, %rsi
000000000046ea7c	callq	*0x18(%rax)
000000000046ea7f	testb	%al, %al
000000000046ea81	je	0x46ebf4
000000000046ea87	movq	(%r15), %rax
000000000046ea8a	leaq	-0x60(%rbp), %rdx
000000000046ea8e	movq	%r15, %rdi
000000000046ea91	movq	%r14, %rsi
000000000046ea94	callq	*(%rax)
000000000046ea96	testb	%al, %al
000000000046ea98	je	0x46ec35
000000000046ea9e	movsd	-0x30(%rbp), %xmm1
000000000046eaa3	movsd	-0x50(%rbp), %xmm6
000000000046eaa8	movsd	-0x28(%rbp), %xmm0
000000000046eaad	movapd	-0x40(%rbp), %xmm2
000000000046eab2	movsd	0x2983ee(%rip), %xmm3
000000000046eaba	movapd	%xmm0, %xmm5
000000000046eabe	mulsd	%xmm3, %xmm5
000000000046eac2	addsd	-0x38(%rbp), %xmm5
000000000046eac7	movapd	%xmm1, %xmm7
000000000046eacb	unpcklpd	%xmm6, %xmm7                    ## xmm7 = xmm7[0],xmm6[0]
000000000046eacf	mulpd	0x296929(%rip), %xmm7
000000000046ead7	movhpd	-0x60(%rbp), %xmm2              ## xmm2 = xmm2[0],mem[0]
000000000046eadc	movsd	-0x48(%rbp), %xmm4
000000000046eae1	mulsd	%xmm4, %xmm3
000000000046eae5	addsd	-0x58(%rbp), %xmm3
000000000046eaea	addpd	%xmm7, %xmm2
000000000046eaee	subsd	%xmm3, %xmm5
000000000046eaf2	movapd	%xmm2, %xmm3
000000000046eaf6	unpckhpd	%xmm2, %xmm3                    ## xmm3 = xmm3[1],xmm2[1]
000000000046eafa	subsd	%xmm3, %xmm2
000000000046eafe	xorpd	%xmm3, %xmm3
000000000046eb02	ucomisd	%xmm3, %xmm2
000000000046eb06	jne	0x46eb0a
000000000046eb08	jnp	0x46eb34
000000000046eb0a	xorpd	%xmm7, %xmm7
000000000046eb0e	mulsd	%xmm2, %xmm7
000000000046eb12	movddup	%xmm7, %xmm8                    ## xmm8 = xmm7[0,0]
000000000046eb17	movsd	0x2968c1(%rip), %xmm7
000000000046eb1f	addpd	%xmm8, %xmm7
000000000046eb24	movupd	%xmm7, (%rbx)
000000000046eb28	movhpd	%xmm7, 0x10(%rbx)
000000000046eb2d	movsd	%xmm2, 0x18(%rbx)
000000000046eb32	jmp	0x46eb40
000000000046eb34	movsd	0x2968a4(%rip), %xmm7
000000000046eb3c	xorpd	%xmm2, %xmm2
000000000046eb40	divsd	%xmm6, %xmm1
000000000046eb44	xorpd	%xmm6, %xmm6
000000000046eb48	ucomisd	%xmm3, %xmm5
000000000046eb4c	jne	0x46eb54
000000000046eb4e	jnp	0x46ebda
000000000046eb54	mulsd	%xmm5, %xmm3
000000000046eb58	movddup	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0]
000000000046eb5c	movhpd	0x29687c(%rip), %xmm6           ## xmm6 = xmm6[0],mem[0]
000000000046eb64	addpd	%xmm3, %xmm6
000000000046eb68	movupd	%xmm6, 0x20(%rbx)
000000000046eb6d	movlpd	%xmm6, 0x30(%rbx)
000000000046eb72	movsd	%xmm5, 0x38(%rbx)
000000000046eb77	movapd	%xmm5, %xmm3
000000000046eb7b	divsd	%xmm4, %xmm0
000000000046eb7f	ucomisd	0x296859(%rip), %xmm1
000000000046eb87	jne	0x46eb8b
000000000046eb89	jnp	0x46eba5
000000000046eb8b	movddup	%xmm1, %xmm4                    ## xmm4 = xmm1[0,0]
000000000046eb8f	mulpd	%xmm7, %xmm4
000000000046eb93	movupd	%xmm4, (%rbx)
000000000046eb97	movhpd	%xmm4, 0x10(%rbx)
000000000046eb9c	mulsd	%xmm1, %xmm2
000000000046eba0	movsd	%xmm2, 0x18(%rbx)
000000000046eba5	ucomisd	0x296833(%rip), %xmm0
000000000046ebad	jne	0x46ebb1
000000000046ebaf	jnp	0x46ebcc
000000000046ebb1	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
000000000046ebb5	mulpd	%xmm6, %xmm1
000000000046ebb9	movupd	%xmm1, 0x20(%rbx)
000000000046ebbe	movlpd	%xmm1, 0x30(%rbx)
000000000046ebc3	mulsd	%xmm0, %xmm3
000000000046ebc7	movsd	%xmm3, 0x38(%rbx)
000000000046ebcc	movq	%rbx, %rax
000000000046ebcf	addq	$0x48, %rsp
000000000046ebd3	popq	%rbx
000000000046ebd4	popq	%r14
000000000046ebd6	popq	%r15
000000000046ebd8	popq	%rbp
000000000046ebd9	retq
000000000046ebda	movhpd	0x2967fe(%rip), %xmm6           ## xmm6 = xmm6[0],mem[0]
000000000046ebe2	divsd	%xmm4, %xmm0
000000000046ebe6	ucomisd	0x2967f2(%rip), %xmm1
000000000046ebee	jne	0x46eb8b
000000000046ebf0	jp	0x46eb8b
000000000046ebf2	jmp	0x46eba5
000000000046ebf4	movl	$0x40, %edi
000000000046ebf9	callq	0x6dfcc0                        ## symbol stub for: ___cxa_allocate_exception
000000000046ebfe	movq	%rax, %r14
000000000046ec01	leaq	0x36e1a2(%rip), %rsi            ## literal pool for: "OZImageMaskRender::getHelium: couldn't get input boundary"
000000000046ec08	leaq	-0x20(%rbp), %rdi
000000000046ec0c	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
000000000046ec11	leaq	-0x20(%rbp), %rsi
000000000046ec15	movq	%r14, %rdi
000000000046ec18	callq	__ZN11PCExceptionC1ERK8PCString ## PCException::PCException(PCString const&)
000000000046ec1d	movq	0x3b4b14(%rip), %rsi            ## literal pool symbol address: __ZTI11PCException
000000000046ec24	leaq	__ZN11PCExceptionD1Ev(%rip), %rdx ## PCException::~PCException()
000000000046ec2b	movq	%r14, %rdi
000000000046ec2e	callq	0x6dfd08                        ## symbol stub for: ___cxa_throw
000000000046ec33	jmp	0x46ec74
000000000046ec35	movl	$0x40, %edi
000000000046ec3a	callq	0x6dfcc0                        ## symbol stub for: ___cxa_allocate_exception
000000000046ec3f	movq	%rax, %r14
000000000046ec42	leaq	0x36e19b(%rip), %rsi            ## literal pool for: "OZImageMaskRender::getHelium: couldn't get mask boundary"
000000000046ec49	leaq	-0x20(%rbp), %rdi
000000000046ec4d	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
000000000046ec52	leaq	-0x20(%rbp), %rsi
000000000046ec56	movq	%r14, %rdi
000000000046ec59	callq	__ZN11PCExceptionC1ERK8PCString ## PCException::PCException(PCString const&)
000000000046ec5e	movq	0x3b4ad3(%rip), %rsi            ## literal pool symbol address: __ZTI11PCException
000000000046ec65	leaq	__ZN11PCExceptionD1Ev(%rip), %rdx ## PCException::~PCException()
000000000046ec6c	movq	%r14, %rdi
000000000046ec6f	callq	0x6dfd08                        ## symbol stub for: ___cxa_throw
000000000046ec74	ud2
000000000046ec76	jmp	0x46ec7a
000000000046ec78	jmp	0x46ec8e
000000000046ec7a	movq	%rax, %rbx
000000000046ec7d	leaq	-0x20(%rbp), %rdi
000000000046ec81	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000046ec86	movq	%rbx, %rdi
000000000046ec89	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046ec8e	movq	%rax, %rbx
000000000046ec91	leaq	-0x20(%rbp), %rdi
000000000046ec95	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000046ec9a	movq	%r14, %rdi
000000000046ec9d	callq	0x6dfce4                        ## symbol stub for: ___cxa_free_exception
000000000046eca2	movq	%rbx, %rdi
000000000046eca5	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046ecaa	jmp	0x46ecac
000000000046ecac	movq	%rax, %rbx
000000000046ecaf	movq	%r14, %rdi
000000000046ecb2	callq	0x6dfce4                        ## symbol stub for: ___cxa_free_exception
000000000046ecb7	movq	%rbx, %rdi
000000000046ecba	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000046ecbf	nop
