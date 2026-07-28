__ZN14HGRenderCinema16SetFocusDistanceEf:
00000000000f3580	movq	0x198(%rdi), %rdi
00000000000f3587	testq	%rdi, %rdi
00000000000f358a	je	0xf35c6
00000000000f358c	pushq	%rbp
00000000000f358d	movq	%rsp, %rbp
00000000000f3590	subq	$0x10, %rsp
00000000000f3594	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f359b	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f35a2	xorl	%ecx, %ecx
00000000000f35a4	movss	%xmm0, -0x4(%rbp)
00000000000f35a9	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f35ae	movss	-0x4(%rbp), %xmm0
00000000000f35b3	testq	%rax, %rax
00000000000f35b6	leaq	0x10(%rsp), %rsp
00000000000f35bb	popq	%rbp
00000000000f35bc	je	0xf35c6
00000000000f35be	movq	%rax, %rdi
00000000000f35c1	jmp	__ZN11HGCinematic16setFocusDistanceEf ## HGCinematic::setFocusDistance(float)
00000000000f35c6	leaq	0x7f3a63(%rip), %rdi            ## literal pool for: "HGRenderCinema : Focus distance not set."
00000000000f35cd	xorl	%eax, %eax
00000000000f35cf	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f35d4	nopw	%cs:(%rax,%rax)
