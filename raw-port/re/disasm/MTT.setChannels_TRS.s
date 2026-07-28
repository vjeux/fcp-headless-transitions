__ZN26MaterialTextureTransformer27setTextureTransformChannelsERK6CMTimeRK9PCVector2IdERKdS6_R11OZChannel2DR19OZChannelRotation3DR14OZChannelScale:
00000000004af700	pushq	%rbp
00000000004af701	movq	%rsp, %rbp
00000000004af704	pushq	%r15
00000000004af706	pushq	%r14
00000000004af708	pushq	%r13
00000000004af70a	pushq	%r12
00000000004af70c	pushq	%rbx
00000000004af70d	pushq	%rax
00000000004af70e	movq	%r9, %rbx
00000000004af711	movq	%rcx, %r14
00000000004af714	movq	%rdx, %r15
00000000004af717	movq	%rdi, %r12
00000000004af71a	movq	0x10(%rbp), %r13
00000000004af71e	movsd	(%rsi), %xmm0
00000000004af722	movsd	0x8(%rsi), %xmm1
00000000004af727	movq	%r8, %rdi
00000000004af72a	movq	%r12, %rsi
00000000004af72d	xorl	%edx, %edx
00000000004af72f	callq	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
00000000004af734	movsd	(%r15), %xmm0
00000000004af739	movq	0x1b8(%rbx), %rax
00000000004af740	addq	$0x1b8, %rbx                    ## imm = 0x1B8
00000000004af747	movq	%rbx, %rdi
00000000004af74a	movq	%r12, %rsi
00000000004af74d	xorl	%edx, %edx
00000000004af74f	callq	*0x2c8(%rax)
00000000004af755	movsd	(%r14), %xmm0
00000000004af75a	movsd	0x8(%r14), %xmm1
00000000004af760	movq	%r13, %rdi
00000000004af763	movq	%r12, %rsi
00000000004af766	xorl	%edx, %edx
00000000004af768	addq	$0x8, %rsp
00000000004af76c	popq	%rbx
00000000004af76d	popq	%r12
00000000004af76f	popq	%r13
00000000004af771	popq	%r14
00000000004af773	popq	%r15
00000000004af775	popq	%rbp
00000000004af776	jmp	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
00000000004af77b	nopl	(%rax,%rax)