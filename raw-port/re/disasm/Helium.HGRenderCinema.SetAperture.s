__ZN14HGRenderCinema11SetApertureEf:
00000000000f3520	movq	0x198(%rdi), %rdi
00000000000f3527	testq	%rdi, %rdi
00000000000f352a	je	0xf3566
00000000000f352c	pushq	%rbp
00000000000f352d	movq	%rsp, %rbp
00000000000f3530	subq	$0x10, %rsp
00000000000f3534	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f353b	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f3542	xorl	%ecx, %ecx
00000000000f3544	movss	%xmm0, -0x4(%rbp)
00000000000f3549	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f354e	movss	-0x4(%rbp), %xmm0
00000000000f3553	testq	%rax, %rax
00000000000f3556	leaq	0x10(%rsp), %rsp
00000000000f355b	popq	%rbp
00000000000f355c	je	0xf3566
00000000000f355e	movq	%rax, %rdi
00000000000f3561	jmp	__ZN11HGCinematic11setApertureEf ## HGCinematic::setAperture(float)
00000000000f3566	leaq	0x7f3aa0(%rip), %rdi            ## literal pool for: "HGRenderCinema : Aperture not set."
00000000000f356d	xorl	%eax, %eax
00000000000f356f	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f3574	nopw	%cs:(%rax,%rax)
