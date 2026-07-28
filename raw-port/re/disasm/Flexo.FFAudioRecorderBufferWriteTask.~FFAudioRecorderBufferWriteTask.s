__ZN30FFAudioRecorderBufferWriteTaskD0Ev:
0000000000d344b0	leaq	0xbde509(%rip), %rax
0000000000d344b7	movq	%rax, (%rdi)
0000000000d344ba	movq	0x18(%rdi), %rax
0000000000d344be	movq	$0x0, 0x18(%rdi)
0000000000d344c6	testq	%rax, %rax
0000000000d344c9	je	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d344cf	pushq	%rbp
0000000000d344d0	movq	%rsp, %rbp
0000000000d344d3	pushq	%rbx
0000000000d344d4	pushq	%rax
0000000000d344d5	movq	(%rax), %rcx
0000000000d344d8	movq	%rdi, %rbx
0000000000d344db	movq	%rax, %rdi
0000000000d344de	callq	*0x8(%rcx)
0000000000d344e1	movq	%rbx, %rdi
0000000000d344e4	addq	$0x8, %rsp
0000000000d344e8	popq	%rbx
0000000000d344e9	popq	%rbp
0000000000d344ea	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d344ef	nop
