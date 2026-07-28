__ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder:
0000000000062bc0	pushq	%rbp
0000000000062bc1	movq	%rsp, %rbp
0000000000062bc4	pushq	%r15
0000000000062bc6	pushq	%r14
0000000000062bc8	pushq	%r13
0000000000062bca	pushq	%r12
0000000000062bcc	pushq	%rbx
0000000000062bcd	subq	$0x18, %rsp
0000000000062bd1	movq	%rdi, -0x40(%rbp)
0000000000062bd5	testq	%rcx, %rcx
0000000000062bd8	je	0x62cfb
0000000000062bde	movq	%rcx, %r12
0000000000062be1	movl	%edx, %r15d
0000000000062be4	movl	%esi, %ebx
0000000000062be6	movq	0x7bfb9b(%rip), %rsi            ## literal pool symbol address: __ZTI15OZChannelFolder
0000000000062bed	movq	0x7bfc0c(%rip), %rdx            ## literal pool symbol address: __ZTI21OZChannelColorNoAlpha
0000000000062bf4	movq	%rcx, %rdi
0000000000062bf7	xorl	%ecx, %ecx
0000000000062bf9	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000062bfe	testq	%rax, %rax
0000000000062c01	je	0x62c98
0000000000062c07	movq	%rax, %r13
0000000000062c0a	testl	%ebx, %ebx
0000000000062c0c	sete	-0x30(%rbp)
0000000000062c10	leaq	0x88(%rax), %r14
0000000000062c17	xorps	%xmm0, %xmm0
0000000000062c1a	movq	%r14, %rdi
0000000000062c1d	callq	0x6df2b8                        ## symbol stub for: __ZN9OZChannel12setSliderMinEd
0000000000062c22	movl	%r15d, -0x34(%rbp)
0000000000062c26	testb	%r15b, %r15b
0000000000062c29	jne	0x62c41
0000000000062c2b	xorl	%ecx, %ecx
0000000000062c2d	movzbl	-0x30(%rbp), %eax
0000000000062c31	movb	%al, %cl
0000000000062c33	leaq	0x6a4a46(%rip), %rax
0000000000062c3a	movsd	(%rax,%rcx,8), %xmm0
0000000000062c3f	jmp	0x62c49
0000000000062c41	movsd	0x6a2797(%rip), %xmm0
0000000000062c49	movq	%r14, %rdi
0000000000062c4c	movsd	%xmm0, -0x30(%rbp)
0000000000062c51	callq	0x6df2b2                        ## symbol stub for: __ZN9OZChannel12setSliderMaxEd
0000000000062c56	leaq	0x120(%r13), %r15
0000000000062c5d	xorps	%xmm0, %xmm0
0000000000062c60	movq	%r15, %rdi
0000000000062c63	callq	0x6df2b8                        ## symbol stub for: __ZN9OZChannel12setSliderMinEd
0000000000062c68	movq	%r15, %rdi
0000000000062c6b	movsd	-0x30(%rbp), %xmm0
0000000000062c70	callq	0x6df2b2                        ## symbol stub for: __ZN9OZChannel12setSliderMaxEd
0000000000062c75	addq	$0x1b8, %r13                    ## imm = 0x1B8
0000000000062c7c	xorps	%xmm0, %xmm0
0000000000062c7f	movq	%r13, %rdi
0000000000062c82	callq	0x6df2b8                        ## symbol stub for: __ZN9OZChannel12setSliderMinEd
0000000000062c87	movq	%r13, %rdi
0000000000062c8a	movsd	-0x30(%rbp), %xmm0
0000000000062c8f	callq	0x6df2b2                        ## symbol stub for: __ZN9OZChannel12setSliderMaxEd
0000000000062c94	movl	-0x34(%rbp), %r15d
0000000000062c98	movq	0x70(%r12), %r12
0000000000062c9d	testq	%r12, %r12
0000000000062ca0	je	0x62cfb
0000000000062ca2	movq	(%r12), %r14
0000000000062ca6	movq	0x8(%r12), %rax
0000000000062cab	cmpq	%rax, %r14
0000000000062cae	je	0x62cfb
0000000000062cb0	movq	0x7bfad1(%rip), %r13            ## literal pool symbol address: __ZTI15OZChannelFolder
0000000000062cb7	movzbl	%r15b, %r15d
0000000000062cbb	jmp	0x62cc9
0000000000062cbd	nopl	(%rax)
0000000000062cc0	addq	$0x8, %r14
0000000000062cc4	cmpq	%rax, %r14
0000000000062cc7	je	0x62cfb
0000000000062cc9	movq	(%r14), %rdi
0000000000062ccc	testb	$0x10, 0x39(%rdi)
0000000000062cd0	je	0x62cc0
0000000000062cd2	movq	0x7bfa57(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000062cd9	movq	%r13, %rdx
0000000000062cdc	xorl	%ecx, %ecx
0000000000062cde	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000062ce3	movq	-0x40(%rbp), %rdi
0000000000062ce7	movl	%ebx, %esi
0000000000062ce9	movl	%r15d, %edx
0000000000062cec	movq	%rax, %rcx
0000000000062cef	callq	__ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder ## OZScene::updateColorChannelsForWorkingGamut(PCWorkingGamutValue, bool, OZChannelFolder*)
0000000000062cf4	movq	0x8(%r12), %rax
0000000000062cf9	jmp	0x62cc0
0000000000062cfb	addq	$0x18, %rsp
0000000000062cff	popq	%rbx
0000000000062d00	popq	%r12
0000000000062d02	popq	%r13
0000000000062d04	popq	%r14
0000000000062d06	popq	%r15
0000000000062d08	popq	%rbp
0000000000062d09	retq
0000000000062d0a	nopw	(%rax,%rax)
