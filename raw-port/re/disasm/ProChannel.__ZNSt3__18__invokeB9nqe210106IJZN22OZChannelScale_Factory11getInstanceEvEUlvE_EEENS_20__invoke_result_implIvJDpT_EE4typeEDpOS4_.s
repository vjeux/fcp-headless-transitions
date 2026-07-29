__ZNSt3__18__invokeB9nqe210106IJZN22OZChannelScale_Factory11getInstanceEvEUlvE_EEENS_20__invoke_result_implIvJDpT_EE4typeEDpOS4_:
0000000000086604	pushq	%rbp
0000000000086605	movq	%rsp, %rbp
0000000000086608	pushq	%r14
000000000008660a	pushq	%rbx
000000000008660b	movl	$0x88, %edi
0000000000086610	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000086615	movq	%rax, %rbx
0000000000086618	movq	%rax, %rdi
000000000008661b	callq	__ZN22OZChannelScale_FactoryC2Ev ## OZChannelScale_Factory::OZChannelScale_Factory()
0000000000086620	movq	%rbx, __ZN22OZChannelScale_Factory9_instanceE(%rip) ## OZChannelScale_Factory::_instance
0000000000086627	popq	%rbx
0000000000086628	popq	%r14
000000000008662a	popq	%rbp
000000000008662b	retq
000000000008662c	movq	%rax, %r14
000000000008662f	movq	%rbx, %rdi
0000000000086632	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000086637	movq	%r14, %rdi
000000000008663a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000008663f	nop
