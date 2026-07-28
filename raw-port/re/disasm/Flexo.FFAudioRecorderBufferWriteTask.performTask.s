__ZN30FFAudioRecorderBufferWriteTask11performTaskEv:
0000000000d344f0	pushq	%rbp
0000000000d344f1	movq	%rsp, %rbp
0000000000d344f4	pushq	%r14
0000000000d344f6	pushq	%rbx
0000000000d344f7	subq	$0x40, %rsp
0000000000d344fb	movq	0x20(%rdi), %rbx
0000000000d344ff	movq	0x10(%rdi), %r14
0000000000d34503	movq	0x18(%rdi), %rdi
0000000000d34507	callq	__ZN17FFAudioBufferList4copyEv  ## FFAudioBufferList::copy()
0000000000d3450c	movq	0x148(%r14), %rsi
0000000000d34513	movq	0x150(%r14), %rdi
0000000000d3451a	movq	0xbb9617(%rip), %rcx            ## literal pool symbol address: __NSConcreteStackBlock
0000000000d34521	movq	%rcx, -0x48(%rbp)
0000000000d34525	movl	$0xc0000000, %ecx               ## imm = 0xC0000000
0000000000d3452a	movq	%rcx, -0x40(%rbp)
0000000000d3452e	leaq	____ZN15FFAudioRecorder11writeBufferEyP17FFAudioBufferList_block_invoke(%rip), %rcx
0000000000d34535	movq	%rcx, -0x38(%rbp)
0000000000d34539	leaq	"___block_descriptor_56_e5_v8?0l"(%rip), %rcx
0000000000d34540	movq	%rcx, -0x30(%rbp)
0000000000d34544	movq	%r14, -0x28(%rbp)
0000000000d34548	movq	%rbx, -0x20(%rbp)
0000000000d3454c	movq	%rax, -0x18(%rbp)
0000000000d34550	leaq	-0x48(%rbp), %rdx
0000000000d34554	callq	0x1497650                       ## symbol stub for: _dispatch_group_async
0000000000d34559	addq	$0x40, %rsp
0000000000d3455d	popq	%rbx
0000000000d3455e	popq	%r14
0000000000d34560	popq	%rbp
0000000000d34561	retq
0000000000d34562	nopw	%cs:(%rax,%rax)
