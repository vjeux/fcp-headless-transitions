__ZNK26FFDestAnalyzerSynchronizer19unlockStream_directEv:
0000000001320380	pushq	%rbp
0000000001320381	movq	%rsp, %rbp
0000000001320384	lock
0000000001320385	decl	0x130(%rdi)
000000000132038b	addq	$0xa0, %rdi
0000000001320392	popq	%rbp
0000000001320393	jmp	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
0000000001320398	nopl	(%rax,%rax)
