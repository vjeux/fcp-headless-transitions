__ZN28HGPagePullMetalTexturesGuardC2EP6HGNodeP6HGPage:
000000000011b980	pushq	%rbp
000000000011b981	movq	%rsp, %rbp
000000000011b984	movq	%rdx, (%rdi)
000000000011b987	testq	%rsi, %rsi
000000000011b98a	je	0x11b9a1
000000000011b98c	movq	(%rsi), %rax
000000000011b98f	movq	0x1d0(%rax), %rax
000000000011b996	movq	%rsi, %rdi
000000000011b999	movq	%rdx, %rsi
000000000011b99c	xorl	%edx, %edx
000000000011b99e	popq	%rbp
000000000011b99f	jmpq	*%rax
000000000011b9a1	popq	%rbp
000000000011b9a2	retq
000000000011b9a3	nopw	%cs:(%rax,%rax)
__ZN28HGPagePullMetalTexturesGuardC1EP6HGNodeP6HGPage:
000000000011b9b0	pushq	%rbp
000000000011b9b1	movq	%rsp, %rbp
000000000011b9b4	movq	%rdx, (%rdi)
000000000011b9b7	testq	%rsi, %rsi
000000000011b9ba	je	0x11b9d1
000000000011b9bc	movq	(%rsi), %rax
000000000011b9bf	movq	0x1d0(%rax), %rax
000000000011b9c6	movq	%rsi, %rdi
000000000011b9c9	movq	%rdx, %rsi
000000000011b9cc	xorl	%edx, %edx
000000000011b9ce	popq	%rbp
000000000011b9cf	jmpq	*%rax
000000000011b9d1	popq	%rbp
000000000011b9d2	retq
000000000011b9d3	nopw	%cs:(%rax,%rax)
__ZN28HGPagePullMetalTexturesGuardD2Ev:
000000000011b9e0	pushq	%rbp
000000000011b9e1	movq	%rsp, %rbp
000000000011b9e4	movq	(%rdi), %rdi
000000000011b9e7	testq	%rdi, %rdi
000000000011b9ea	je	0x11b9f1
000000000011b9ec	callq	__ZN6HGPage15ReleaseTexturesEv  ## HGPage::ReleaseTextures()
000000000011b9f1	popq	%rbp
000000000011b9f2	retq
000000000011b9f3	movq	%rax, %rdi
000000000011b9f6	callq	___clang_call_terminate
000000000011b9fb	nopl	(%rax,%rax)
__ZN28HGPagePullMetalTexturesGuardD1Ev:
000000000011ba00	pushq	%rbp
000000000011ba01	movq	%rsp, %rbp
000000000011ba04	movq	(%rdi), %rdi
000000000011ba07	testq	%rdi, %rdi
000000000011ba0a	je	0x11ba11
000000000011ba0c	callq	__ZN6HGPage15ReleaseTexturesEv  ## HGPage::ReleaseTextures()
000000000011ba11	popq	%rbp
000000000011ba12	retq
000000000011ba13	movq	%rax, %rdi
000000000011ba16	callq	___clang_call_terminate
000000000011ba1b	nopl	(%rax,%rax)
__ZN11HGNodeInputC2EP6HGNodei:
000000000011ba20	pushq	%rbp
000000000011ba21	movq	%rsp, %rbp
000000000011ba24	movq	%rsi, (%rdi)
