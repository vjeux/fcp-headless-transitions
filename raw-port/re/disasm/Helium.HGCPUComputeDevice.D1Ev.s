__ZN18HGCPUComputeDeviceD1Ev:
00000000001172e0	pushq	%rbp
00000000001172e1	movq	%rsp, %rbp
00000000001172e4	pushq	%rbx
00000000001172e5	pushq	%rax
00000000001172e6	movq	%rdi, %rbx
00000000001172e9	testb	$0x1, 0x48(%rdi)
00000000001172ed	je	0x1172f8
00000000001172ef	movq	0x58(%rbx), %rdi
00000000001172f3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001172f8	leaq	__ZTV15HGComputeDevice(%rip), %rax ## vtable for HGComputeDevice
00000000001172ff	addq	$0x10, %rax
0000000000117303	movq	%rax, (%rbx)
0000000000117306	testb	$0x1, 0x28(%rbx)
000000000011730a	je	0x117315
000000000011730c	movq	0x38(%rbx), %rdi
0000000000117310	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117315	testb	$0x1, 0x10(%rbx)
0000000000117319	jne	0x117322
000000000011731b	addq	$0x8, %rsp
000000000011731f	popq	%rbx
0000000000117320	popq	%rbp
0000000000117321	retq
0000000000117322	movq	0x20(%rbx), %rdi
0000000000117326	addq	$0x8, %rsp
000000000011732a	popq	%rbx
000000000011732b	popq	%rbp
000000000011732c	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117331	nopw	%cs:(%rax,%rax)
