__ZN14HGRenderCinema19SetTransferFunctionEPK10__CFString:
00000000000f3650	pushq	%rbp
00000000000f3651	movq	%rsp, %rbp
00000000000f3654	pushq	%rbx
00000000000f3655	pushq	%rax
00000000000f3656	movq	0x198(%rdi), %rdi
00000000000f365d	testq	%rdi, %rdi
00000000000f3660	je	0xf3690
00000000000f3662	movq	%rsi, %rbx
00000000000f3665	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f366c	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f3673	xorl	%ecx, %ecx
00000000000f3675	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f367a	testq	%rax, %rax
00000000000f367d	je	0xf3690
00000000000f367f	movq	%rax, %rdi
00000000000f3682	movq	%rbx, %rsi
00000000000f3685	addq	$0x8, %rsp
00000000000f3689	popq	%rbx
00000000000f368a	popq	%rbp
00000000000f368b	jmp	__ZN11HGCinematic19setTransferFunctionEPK10__CFString ## HGCinematic::setTransferFunction(__CFString const*)
00000000000f3690	leaq	0x7f39eb(%rip), %rdi            ## literal pool for: "HGRenderCinema : Transfer function not set."
00000000000f3697	xorl	%eax, %eax
00000000000f3699	addq	$0x8, %rsp
00000000000f369d	popq	%rbx
00000000000f369e	popq	%rbp
00000000000f369f	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f36a4	nopw	%cs:(%rax,%rax)
