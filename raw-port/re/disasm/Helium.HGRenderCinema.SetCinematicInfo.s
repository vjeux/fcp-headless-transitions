__ZN14HGRenderCinema16SetCinematicInfoEP28CNRenderingSessionAttributesP33CNRenderingSessionFrameAttributes:
00000000000f3760	pushq	%rbp
00000000000f3761	movq	%rsp, %rbp
00000000000f3764	pushq	%r14
00000000000f3766	pushq	%rbx
00000000000f3767	movq	0x198(%rdi), %rdi
00000000000f376e	testq	%rdi, %rdi
00000000000f3771	je	0xf37a5
00000000000f3773	movq	%rdx, %rbx
00000000000f3776	movq	%rsi, %r14
00000000000f3779	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f3780	leaq	__ZTI11HGCinematic(%rip), %rdx  ## typeinfo for HGCinematic
00000000000f3787	xorl	%ecx, %ecx
00000000000f3789	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f378e	testq	%rax, %rax
00000000000f3791	je	0xf37a5
00000000000f3793	movq	%rax, %rdi
00000000000f3796	movq	%r14, %rsi
00000000000f3799	movq	%rbx, %rdx
00000000000f379c	popq	%rbx
00000000000f379d	popq	%r14
00000000000f379f	popq	%rbp
00000000000f37a0	jmp	__ZN11HGCinematic16SetCinematicInfoEP28CNRenderingSessionAttributesP33CNRenderingSessionFrameAttributes ## HGCinematic::SetCinematicInfo(CNRenderingSessionAttributes*, CNRenderingSessionFrameAttributes*)
00000000000f37a5	leaq	0x7f3902(%rip), %rdi            ## literal pool for: "HGRenderCinema : SetCinematicInfo not set"
00000000000f37ac	xorl	%eax, %eax
00000000000f37ae	popq	%rbx
00000000000f37af	popq	%r14
00000000000f37b1	popq	%rbp
00000000000f37b2	jmp	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f37b7	nopw	(%rax,%rax)
