__ZN17OZARAnchorElement11descriptionEv:
000000000062c850	pushq	%rbp
000000000062c851	movq	%rsp, %rbp
000000000062c854	pushq	%rbx
000000000062c855	pushq	%rax
000000000062c856	movq	%rdi, %rbx
000000000062c859	leaq	_theApp(%rip), %rax
000000000062c860	movq	(%rax), %rax
000000000062c863	movq	0x48(%rax), %rdx
000000000062c867	leaq	0x282e62(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000062c86e	xorl	%ecx, %ecx
000000000062c870	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000062c875	movq	%rbx, %rax
000000000062c878	addq	$0x8, %rsp
000000000062c87c	popq	%rbx
000000000062c87d	popq	%rbp
000000000062c87e	retq
000000000062c87f	nop
