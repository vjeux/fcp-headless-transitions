__ZN18HGCPUComputeDeviceD0Ev:
0000000000117340	pushq	%rbp
0000000000117341	movq	%rsp, %rbp
0000000000117344	pushq	%rbx
0000000000117345	pushq	%rax
0000000000117346	movq	%rdi, %rbx
0000000000117349	testb	$0x1, 0x48(%rdi)
000000000011734d	je	0x117358
000000000011734f	movq	0x58(%rbx), %rdi
0000000000117353	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117358	leaq	__ZTV15HGComputeDevice(%rip), %rax ## vtable for HGComputeDevice
000000000011735f	addq	$0x10, %rax
0000000000117363	movq	%rax, (%rbx)
0000000000117366	testb	$0x1, 0x28(%rbx)
000000000011736a	je	0x117375
000000000011736c	movq	0x38(%rbx), %rdi
0000000000117370	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117375	testb	$0x1, 0x10(%rbx)
0000000000117379	je	0x117384
000000000011737b	movq	0x20(%rbx), %rdi
000000000011737f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117384	movq	%rbx, %rdi
0000000000117387	addq	$0x8, %rsp
000000000011738b	popq	%rbx
000000000011738c	popq	%rbp
000000000011738d	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000117392	nopw	%cs:(%rax,%rax)
