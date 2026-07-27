__ZN22OZChannelTimeConverter25IsEnabledForCurrentThreadEv:
00000000000a9110	pushq	%rbp
00000000000a9111	movq	%rsp, %rbp
00000000000a9114	cmpq	$-0x1, __ZZN23OZPerThreadDisableCount11getInstanceEvE4once(%rip) ## OZPerThreadDisableCount::getInstance()::once
00000000000a911c	jne	0xa913e
00000000000a911e	movq	__ZZN23OZPerThreadDisableCount11getInstanceEvE22sPerThreadDisableCount(%rip), %rax ## OZPerThreadDisableCount::getInstance()::sPerThreadDisableCount
00000000000a9125	movq	(%rax), %rdi
00000000000a9128	callq	0xacf66                         ## symbol stub for: _pthread_getspecific
00000000000a912d	testq	%rax, %rax
00000000000a9130	je	0xa913a
00000000000a9132	cmpl	$0x0, (%rax)
00000000000a9135	sete	%al
00000000000a9138	jmp	0xa913c
00000000000a913a	movb	$0x1, %al
00000000000a913c	popq	%rbp
00000000000a913d	retq
00000000000a913e	callq	__ZN22OZChannelTimeConverter25IsEnabledForCurrentThreadEv.cold.1 ## OZChannelTimeConverter::IsEnabledForCurrentThread() (.cold.1)
00000000000a9143	jmp	0xa911e
