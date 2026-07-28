__ZN23HGPagePullTexturesGuardC1EP6HGNodeP6HGPage:
000000000011b910	pushq	%rbp
000000000011b911	movq	%rsp, %rbp
000000000011b914	movq	%rdx, (%rdi)
000000000011b917	testq	%rsi, %rsi
000000000011b91a	je	0x11b931
000000000011b91c	movq	(%rsi), %rax
000000000011b91f	movq	0x1c8(%rax), %rax
000000000011b926	movq	%rsi, %rdi
000000000011b929	movq	%rdx, %rsi
000000000011b92c	xorl	%edx, %edx
000000000011b92e	popq	%rbp
000000000011b92f	jmpq	*%rax
000000000011b931	popq	%rbp
000000000011b932	retq
000000000011b933	nopw	%cs:(%rax,%rax)
