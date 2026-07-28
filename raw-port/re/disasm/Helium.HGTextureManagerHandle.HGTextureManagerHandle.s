__ZN22HGTextureManagerHandleC2Ev:
0000000000043e80	pushq	%rbp
0000000000043e81	movq	%rsp, %rbp
0000000000043e84	pushq	%rbx
0000000000043e85	pushq	%rax
0000000000043e86	movq	%rdi, %rbx
0000000000043e89	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000043e8e	leaq	__ZTV22HGTextureManagerHandle(%rip), %rax ## vtable for HGTextureManagerHandle
0000000000043e95	addq	$0x10, %rax
0000000000043e99	movq	%rax, (%rbx)
0000000000043e9c	addq	$0x8, %rsp
0000000000043ea0	popq	%rbx
0000000000043ea1	popq	%rbp
0000000000043ea2	retq
0000000000043ea3	nopw	%cs:(%rax,%rax)
