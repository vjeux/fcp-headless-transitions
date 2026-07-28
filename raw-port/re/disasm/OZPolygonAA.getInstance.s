__ZN11OZPolygonAA11getInstanceEv:
000000000015b1f0	cmpq	$-0x1, __ZZN11OZPolygonAA11getInstanceEvE4once(%rip) ## OZPolygonAA::getInstance()::once
000000000015b1f8	jne	0x15b202
000000000015b1fa	movq	__ZN11OZPolygonAA9_instanceE(%rip), %rax ## OZPolygonAA::_instance
000000000015b201	retq
000000000015b202	pushq	%rbp
000000000015b203	movq	%rsp, %rbp
000000000015b206	callq	__ZN11OZPolygonAA11getInstanceEv.cold.1 ## OZPolygonAA::getInstance() (.cold.1)
000000000015b20b	popq	%rbp
000000000015b20c	movq	__ZN11OZPolygonAA9_instanceE(%rip), %rax ## OZPolygonAA::_instance
000000000015b213	retq
000000000015b214	nopw	%cs:(%rax,%rax)
