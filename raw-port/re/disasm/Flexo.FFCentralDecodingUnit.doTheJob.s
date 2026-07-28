__ZN21FFCentralDecodingUnit8doTheJobEP23FFScheduleTokenVTDecode:
0000000000e00040	pushq	%rbp
0000000000e00041	movq	%rsp, %rbp
0000000000e00044	pushq	%rbx
0000000000e00045	subq	$0x28, %rsp
0000000000e00049	movq	%rsi, %rbx
0000000000e0004c	movq	0xdd192d(%rip), %rsi
0000000000e00053	movq	%rbx, %rdi
0000000000e00056	callq	*0xaed664(%rip)                 ## Objc message: -[%rdi _notifyRecordingHasStopped]
0000000000e0005c	movl	%eax, %edi
0000000000e0005e	callq	_FFSVPriorityGetQOSClass
0000000000e00063	movq	0xaedace(%rip), %rcx            ## literal pool symbol address: __NSConcreteStackBlock
0000000000e0006a	movq	%rcx, -0x30(%rbp)
0000000000e0006e	movl	$0xc2000000, %ecx               ## imm = 0xC2000000
0000000000e00073	movq	%rcx, -0x28(%rbp)
0000000000e00077	leaq	____ZN21FFCentralDecodingUnit8doTheJobEP23FFScheduleTokenVTDecode_block_invoke(%rip), %rcx
0000000000e0007e	movq	%rcx, -0x20(%rbp)
0000000000e00082	leaq	"___block_descriptor_40_e8_32o_e5_v8?0l"(%rip), %rcx
0000000000e00089	movq	%rcx, -0x18(%rbp)
0000000000e0008d	movq	%rbx, -0x10(%rbp)
0000000000e00091	leaq	-0x30(%rbp), %rcx
0000000000e00095	movl	$0x20, %edi
0000000000e0009a	movl	%eax, %esi
0000000000e0009c	xorl	%edx, %edx
0000000000e0009e	callq	0x1497632                       ## symbol stub for: _dispatch_block_create_with_qos_class
0000000000e000a3	movq	%rax, %rbx
0000000000e000a6	movl	$0x20, %edi
0000000000e000ab	movq	%rax, %rsi
0000000000e000ae	callq	0x1497638                       ## symbol stub for: _dispatch_block_perform
0000000000e000b3	movq	%rbx, %rdi
0000000000e000b6	callq	0x1495cf4                       ## symbol stub for: __Block_release
0000000000e000bb	addq	$0x28, %rsp
0000000000e000bf	popq	%rbx
0000000000e000c0	popq	%rbp
0000000000e000c1	retq
0000000000e000c2	nopw	%cs:(%rax,%rax)
