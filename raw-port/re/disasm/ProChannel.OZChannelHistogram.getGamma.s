
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000070564 <__ZN18OZChannelHistogram8getGammaEi>:
   70564: 55                           	pushq	%rbp
   70565: 48 89 e5                     	movq	%rsp, %rbp
   70568: 83 fe 04                     	cmpl	$0x4, %esi
   7056b: 77 3d                        	ja	0x705aa <__ZN18OZChannelHistogram8getGammaEi+0x46>
   7056d: 48 89 f8                     	movq	%rdi, %rax
   70570: 89 f1                        	movl	%esi, %ecx
   70572: 48 8d 15 37 00 00 00         	leaq	0x37(%rip), %rdx        ## 0x705b0 <__ZN18OZChannelHistogram8getGammaEi+0x4c>
   70579: 48 63 0c 8a                  	movslq	(%rdx,%rcx,4), %rcx
   7057d: 48 01 d1                     	addq	%rdx, %rcx
   70580: ff e1                        	jmpq	*%rcx
   70582: 48 05 70 04 00 00            	addq	$0x470, %rax            ## imm = 0x470
   70588: eb 22                        	jmp	0x705ac <__ZN18OZChannelHistogram8getGammaEi+0x48>
   7058a: 48 05 70 12 00 00            	addq	$0x1270, %rax           ## imm = 0x1270
   70590: eb 1a                        	jmp	0x705ac <__ZN18OZChannelHistogram8getGammaEi+0x48>
   70592: 48 05 70 0b 00 00            	addq	$0xb70, %rax            ## imm = 0xB70
   70598: eb 12                        	jmp	0x705ac <__ZN18OZChannelHistogram8getGammaEi+0x48>
   7059a: 48 05 f0 0e 00 00            	addq	$0xef0, %rax            ## imm = 0xEF0
   705a0: eb 0a                        	jmp	0x705ac <__ZN18OZChannelHistogram8getGammaEi+0x48>
   705a2: 48 05 f0 07 00 00            	addq	$0x7f0, %rax            ## imm = 0x7F0
   705a8: eb 02                        	jmp	0x705ac <__ZN18OZChannelHistogram8getGammaEi+0x48>
   705aa: 31 c0                        	xorl	%eax, %eax
   705ac: 5d                           	popq	%rbp
   705ad: c3                           	retq
   705ae: 66 90                        	nop
   705b0: d2 ff                        	sarb	%cl, %bh
   705b2: ff ff                        	<unknown>
   705b4: f2 ff ff                     	<unknown>
   705b7: ff e2                        	jmpq	*%rdx
   705b9: ff ff                        	<unknown>
   705bb: ff ea                        	<unknown>
   705bd: ff ff                        	<unknown>
   705bf: ff da                        	<unknown>
   705c1: ff ff                        	<unknown>
   705c3: ff 55 48                     	callq	*0x48(%rbp)
