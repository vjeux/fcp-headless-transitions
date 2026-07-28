__ZN10OZDocument16postNotificationEj:
0000000000046970	pushq	%rbp
0000000000046971	movq	%rsp, %rbp
0000000000046974	movq	0x98(%rdi), %rdi
000000000004697b	testq	%rdi, %rdi
000000000004697e	je	0x46986
0000000000046980	popq	%rbp
0000000000046981	jmp	__ZN21OZNotificationManager16postNotificationEj ## OZNotificationManager::postNotification(unsigned int)
0000000000046986	popq	%rbp
0000000000046987	retq
0000000000046988	nopl	(%rax,%rax)
