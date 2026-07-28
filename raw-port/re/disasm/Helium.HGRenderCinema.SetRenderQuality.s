__ZN14HGRenderCinema16SetRenderQualityEi:
00000000000f35f0	pushq	%rbp
00000000000f35f1	movq	%rsp, %rbp
00000000000f35f4	pushq	%rbx
00000000000f35f5	pushq	%rax
00000000000f35f6	movq	0x198(%rdi), %rdi
00000000000f35fd	testq	%rdi, %rdi
00000000000f3600	je	0xf362e
00000000000f3602	movl	%esi, %ebx
00000000000f3604	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f360b	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f3612	xorl	%ecx, %ecx
00000000000f3614	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f3619	testq	%rax, %rax
00000000000f361c	je	0xf362e
00000000000f361e	movq	%rax, %rdi
00000000000f3621	movl	%ebx, %esi
00000000000f3623	addq	$0x8, %rsp
00000000000f3627	popq	%rbx
00000000000f3628	popq	%rbp
00000000000f3629	jmp	__ZN11HGCinematic16SetRenderQualityEi ## HGCinematic::SetRenderQuality(int)
00000000000f362e	leaq	0x7f3a24(%rip), %rdi            ## literal pool for: "HGRenderCinema : Render quality not set."
00000000000f3635	xorl	%eax, %eax
00000000000f3637	addq	$0x8, %rsp
00000000000f363b	popq	%rbx
00000000000f363c	popq	%rbp
00000000000f363d	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f3642	nopw	%cs:(%rax,%rax)
