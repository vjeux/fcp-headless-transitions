__ZN13OZCoreGlobals11getInstanceEv:
0000000000013c50	cmpq	$-0x1, __ZZN13OZCoreGlobals11getInstanceEvE4once(%rip) ## OZCoreGlobals::getInstance()::once
0000000000013c58	jne	0x13c62
0000000000013c5a	movq	__ZN13OZCoreGlobals9_instanceE(%rip), %rax ## OZCoreGlobals::_instance
0000000000013c61	retq
0000000000013c62	pushq	%rbp
0000000000013c63	movq	%rsp, %rbp
0000000000013c66	callq	__ZN13OZCoreGlobals11getInstanceEv.cold.1 ## OZCoreGlobals::getInstance() (.cold.1)
0000000000013c6b	popq	%rbp
0000000000013c6c	jmp	0x13c5a
