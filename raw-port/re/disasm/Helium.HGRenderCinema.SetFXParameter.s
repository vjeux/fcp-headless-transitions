__ZN14HGRenderCinema14SetFXParameterENS_9ParamTypeEf:
00000000000f3450	pushq	%rbp
00000000000f3451	movq	%rsp, %rbp
00000000000f3454	subq	$0x10, %rsp
00000000000f3458	cmpl	$0x1, %esi
00000000000f345b	je	0xf34a2
00000000000f345d	testl	%esi, %esi
00000000000f345f	jne	0xf34df
00000000000f3461	movq	0x198(%rdi), %rdi
00000000000f3468	testq	%rdi, %rdi
00000000000f346b	je	0xf34f2
00000000000f3471	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f3478	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f347f	xorl	%ecx, %ecx
00000000000f3481	movss	%xmm0, -0x4(%rbp)
00000000000f3486	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f348b	movss	-0x4(%rbp), %xmm0
00000000000f3490	testq	%rax, %rax
00000000000f3493	je	0xf34f2
00000000000f3495	movq	%rax, %rdi
00000000000f3498	addq	$0x10, %rsp
00000000000f349c	popq	%rbp
00000000000f349d	jmp	__ZN11HGCinematic11setApertureEf ## HGCinematic::setAperture(float)
00000000000f34a2	movq	0x198(%rdi), %rdi
00000000000f34a9	testq	%rdi, %rdi
00000000000f34ac	je	0xf3505
00000000000f34ae	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f34b5	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f34bc	xorl	%ecx, %ecx
00000000000f34be	movss	%xmm0, -0x4(%rbp)
00000000000f34c3	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f34c8	movss	-0x4(%rbp), %xmm0
00000000000f34cd	testq	%rax, %rax
00000000000f34d0	je	0xf3505
00000000000f34d2	movq	%rax, %rdi
00000000000f34d5	addq	$0x10, %rsp
00000000000f34d9	popq	%rbp
00000000000f34da	jmp	__ZN11HGCinematic16setFocusDistanceEf ## HGCinematic::setFocusDistance(float)
00000000000f34df	leaq	0x7f3ad2(%rip), %rdi            ## literal pool for: "HGRenderCinema : Valid FX Parameter type not provided while setting parameter value."
00000000000f34e6	xorl	%eax, %eax
00000000000f34e8	addq	$0x10, %rsp
00000000000f34ec	popq	%rbp
00000000000f34ed	jmp	__ZN8HGLogger5errorEPKcz        ## HGLogger::error(char const*, ...)
00000000000f34f2	leaq	0x7f3b14(%rip), %rdi            ## literal pool for: "HGRenderCinema : Aperture not set."
00000000000f34f9	xorl	%eax, %eax
00000000000f34fb	addq	$0x10, %rsp
00000000000f34ff	popq	%rbp
00000000000f3500	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f3505	leaq	0x7f3b24(%rip), %rdi            ## literal pool for: "HGRenderCinema : Focus distance not set."
00000000000f350c	xorl	%eax, %eax
00000000000f350e	addq	$0x10, %rsp
00000000000f3512	popq	%rbp
00000000000f3513	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f3518	nopl	(%rax,%rax)
