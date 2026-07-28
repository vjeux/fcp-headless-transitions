__ZN13OZChannelQuadD1Ev:
000000000009a720	pushq	%rbp
000000000009a721	movq	%rsp, %rbp
000000000009a724	pushq	%rbx
000000000009a725	pushq	%rax
000000000009a726	movq	%rdi, %rbx
000000000009a729	movq	0x788168(%rip), %rax            ## literal pool symbol address: __ZTV13OZChannelQuad
000000000009a730	leaq	0x10(%rax), %rcx
000000000009a734	movq	%rcx, (%rdi)
000000000009a737	addq	$0x348, %rax                    ## imm = 0x348
000000000009a73d	movq	%rax, 0x10(%rdi)
000000000009a741	addq	$0x8c8, %rdi                    ## imm = 0x8C8
000000000009a748	callq	0x6de292                        ## symbol stub for: __ZN17OZChannelPositionD1Ev
000000000009a74d	leaq	0x608(%rbx), %rdi
000000000009a754	callq	0x6de292                        ## symbol stub for: __ZN17OZChannelPositionD1Ev
000000000009a759	leaq	0x348(%rbx), %rdi
000000000009a760	callq	0x6de292                        ## symbol stub for: __ZN17OZChannelPositionD1Ev
000000000009a765	leaq	0x88(%rbx), %rdi
000000000009a76c	callq	0x6de292                        ## symbol stub for: __ZN17OZChannelPositionD1Ev
000000000009a771	movq	%rbx, %rdi
000000000009a774	addq	$0x8, %rsp
000000000009a778	popq	%rbx
000000000009a779	popq	%rbp
000000000009a77a	jmp	0x6de2b6                        ## symbol stub for: __ZN17OZCompoundChannelD2Ev
